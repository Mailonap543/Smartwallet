package com.smartwallet.service;

import com.smartwallet.dto.transaction.CreateTransactionRequest;
import com.smartwallet.dto.transaction.TransactionResponse;
import com.smartwallet.entity.Asset;
import com.smartwallet.entity.Transaction;
import com.smartwallet.entity.Transaction.TransactionType;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.repository.TransactionRepository;
import com.smartwallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    @Transactional
    public TransactionResponse createTransaction(Long userId, Long assetId, CreateTransactionRequest request) {
        validateUserExists(userId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Ativo não encontrado"));
        validateAssetAccess(asset, userId);

        BigDecimal totalValue = request.quantity().multiply(request.price());
        BigDecimal fees = request.fees() != null ? request.fees() : BigDecimal.ZERO;
        BigDecimal totalWithFees = totalValue.add(fees);

        Transaction transaction = Transaction.builder()
                .asset(asset)
                .transactionType(request.transactionType())
                .quantity(request.quantity())
                .price(request.price())
                .totalValue(totalValue)
                .fees(fees)
                .totalWithFees(totalWithFees)
                .transactionDate(request.transactionDate() != null ? request.transactionDate() : LocalDate.now().atStartOfDay())
                .notes(request.notes())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Transaction created: {} - {} for asset: {}", request.transactionType(), transaction.getId(), asset.getSymbol());

        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateAssetAccess(transaction.getAsset(), userId);
        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactionsByUserId(Long userId) {
        validateUserExists(userId);
        return transactionRepository.findByUserId(userId).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAssetId(Long userId, Long assetId) {
        validateUserExists(userId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Ativo não encontrado"));
        validateAssetAccess(asset, userId);
        return transactionRepository.findByAssetIdOrderedByDateDesc(assetId).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, CreateTransactionRequest request) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateAssetAccess(transaction.getAsset(), userId);

        BigDecimal totalValue = request.quantity().multiply(request.price());
        BigDecimal fees = request.fees() != null ? request.fees() : BigDecimal.ZERO;
        BigDecimal totalWithFees = totalValue.add(fees);

        transaction.setTransactionType(request.transactionType());
        transaction.setQuantity(request.quantity());
        transaction.setPrice(request.price());
        transaction.setTotalValue(totalValue);
        transaction.setFees(fees);
        transaction.setTotalWithFees(totalWithFees);
        transaction.setTransactionDate(request.transactionDate() != null ? request.transactionDate() : LocalDate.now().atStartOfDay());
        transaction.setNotes(request.notes());

        transaction = transactionRepository.save(transaction);
        log.info("Transaction updated: {} for asset: {}", transactionId, transaction.getAsset().getSymbol());

        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        validateAssetAccess(transaction.getAsset(), userId);
        transactionRepository.delete(transaction);
        log.info("Transaction deleted: {} for asset: {}", transactionId, transaction.getAsset().getSymbol());
    }

    @Transactional
    public void recalculateAssetFromTransactions(Asset asset) {
        List<Transaction> transactions = transactionRepository.findByAssetIdOrderedByDateDesc(asset.getId());

        if (transactions.isEmpty()) {
            asset.setQuantity(BigDecimal.ZERO);
            asset.setAveragePrice(BigDecimal.ZERO);
            asset.setTotalInvested(BigDecimal.ZERO);
            asset.setCurrentValue(BigDecimal.ZERO);
            asset.setProfitLoss(BigDecimal.ZERO);
            asset.setProfitLossPercentage(BigDecimal.ZERO);
            assetRepository.save(asset);
            return;
        }

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            switch (t.getTransactionType()) {
                case BUY -> {
                    BigDecimal cost = t.getTotalWithFees() != null ? t.getTotalWithFees() : t.getTotalValue();
                    totalQuantity = totalQuantity.add(t.getQuantity());
                    totalCost = totalCost.add(cost);
                }
                case SELL -> {
                    BigDecimal avgPrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0
                            ? totalCost.divide(totalQuantity, 8, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    totalCost = totalCost.subtract(avgPrice.multiply(t.getQuantity()));
                    totalQuantity = totalQuantity.subtract(t.getQuantity());
                }
                default -> {
                }
            }
        }

        if (totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            asset.setQuantity(totalQuantity);
            asset.setAveragePrice(totalCost.divide(totalQuantity, 2, RoundingMode.HALF_UP));
            asset.setTotalInvested(totalCost);
        } else {
            asset.setQuantity(BigDecimal.ZERO);
            asset.setAveragePrice(BigDecimal.ZERO);
            asset.setTotalInvested(BigDecimal.ZERO);
        }

        asset.calculateProfitLoss();
        assetRepository.save(asset);
    }

    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
    }

    private void validateAssetAccess(Asset asset, Long userId) {
        if (!asset.getWallet().getUser().getId().equals(userId)) {
            throw new BusinessException("Acesso negado", "ACCESS_DENIED");
        }
    }
}
