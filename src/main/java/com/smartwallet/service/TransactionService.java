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

        recalculateAssetFromTransactions(asset);

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

        recalculateAssetFromTransactions(transaction.getAsset());

        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        Asset asset = transaction.getAsset();
        validateAssetAccess(asset, userId);
        transactionRepository.delete(transaction);
        log.info("Transaction deleted: {} for asset: {}", transactionId, asset.getSymbol());

        recalculateAssetFromTransactions(asset);
    }

    @Transactional
    public void recalculateAssetFromTransactions(Asset asset) {
        List<Transaction> transactions = transactionRepository.findByAssetIdOrderedByDateDesc(asset.getId());

        if (transactions.isEmpty()) {
            applyManualAssetTotals(asset);
        } else {
            applyTransactionTotals(asset, calculateTransactionTotals(transactions));
        }

        asset.calculateProfitLoss();
        assetRepository.save(asset);
    }

    private void applyManualAssetTotals(Asset asset) {
        BigDecimal quantity = valueOrZero(asset.getQuantity());
        BigDecimal purchasePrice = valueOrZero(asset.getPurchasePrice());
        BigDecimal currentPrice = asset.getCurrentPrice() != null ? asset.getCurrentPrice() : purchasePrice;

        asset.setAveragePrice(asset.getAveragePrice() != null ? asset.getAveragePrice() : purchasePrice);
        asset.setTotalInvested(quantity.multiply(purchasePrice));
        asset.setCurrentValue(quantity.multiply(currentPrice));
    }

    private TransactionTotals calculateTransactionTotals(List<Transaction> transactions) {
        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (isBuyTransaction(transaction)) {
                totalQuantity = totalQuantity.add(transaction.getQuantity());
                totalCost = totalCost.add(totalTransactionCost(transaction));
            } else if (isSellTransaction(transaction)) {
                BigDecimal averagePrice = averagePrice(totalCost, totalQuantity, 8);
                totalCost = totalCost.subtract(averagePrice.multiply(transaction.getQuantity()));
                totalQuantity = totalQuantity.subtract(transaction.getQuantity());
            }
        }

        return new TransactionTotals(totalQuantity, totalCost);
    }

    private void applyTransactionTotals(Asset asset, TransactionTotals totals) {
        if (totals.quantity().compareTo(BigDecimal.ZERO) <= 0) {
            clearAssetTotals(asset);
            return;
        }

        asset.setQuantity(totals.quantity());
        asset.setAveragePrice(averagePrice(totals.cost(), totals.quantity(), 2));
        asset.setTotalInvested(totals.cost());
        BigDecimal currentPrice = asset.getCurrentPrice() != null ? asset.getCurrentPrice() : asset.getAveragePrice();
        asset.setCurrentValue(totals.quantity().multiply(currentPrice));
    }

    private void clearAssetTotals(Asset asset) {
        asset.setQuantity(BigDecimal.ZERO);
        asset.setAveragePrice(BigDecimal.ZERO);
        asset.setTotalInvested(BigDecimal.ZERO);
        asset.setCurrentValue(BigDecimal.ZERO);
    }

    private BigDecimal totalTransactionCost(Transaction transaction) {
        return transaction.getTotalWithFees() != null ? transaction.getTotalWithFees() : transaction.getTotalValue();
    }

    private boolean isBuyTransaction(Transaction transaction) {
        return hasTransactionType(transaction, "BUY");
    }

    private boolean isSellTransaction(Transaction transaction) {
        return hasTransactionType(transaction, "SELL");
    }

    private boolean hasTransactionType(Transaction transaction, String expectedType) {
        return transaction.getTransactionType() != null
                && expectedType.equals(transaction.getTransactionType().name());
    }

    private BigDecimal averagePrice(BigDecimal totalCost, BigDecimal totalQuantity, int scale) {
        if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return totalCost.divide(totalQuantity, scale, RoundingMode.HALF_UP);
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private record TransactionTotals(BigDecimal quantity, BigDecimal cost) {
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
