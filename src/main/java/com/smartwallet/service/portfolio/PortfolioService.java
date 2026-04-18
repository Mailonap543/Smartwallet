package com.smartwallet.service.portfolio;

import com.smartwallet.dto.asset.*;
import com.smartwallet.dto.transaction.*;
import com.smartwallet.dto.wallet.*;
import com.smartwallet.entity.*;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public WalletResponse createWallet(Long userId, CreateWalletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Wallet wallet = Wallet.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .totalBalance(BigDecimal.ZERO)
                .totalInvested(BigDecimal.ZERO)
                .totalProfitLoss(BigDecimal.ZERO)
                .build();

        wallet = walletRepository.save(wallet);
        logger.info("Wallet created: {} for user: {}", wallet.getId(), userId);

        return WalletResponse.fromEntity(wallet);
    }

    public List<WalletResponse> getUserWallets(Long userId) {
        logger.info("getUserWallets called for userId: {}", userId);
        
        if (userId == null) {
            logger.error("userId is null!");
            throw new BusinessException("ID do usuário não fornecido", "USER_ID_NULL");
        }
        
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        logger.info("Found {} wallets for userId: {}", wallets.size(), userId);
        
        return wallets.stream()
                .map(WalletResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public WalletResponse getWalletById(Long walletId, Long userId) {
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));
        recalculateWalletTotals(wallet);
        return WalletResponse.fromEntity(wallet);
    }

    @Transactional
    public AssetResponse addAsset(Long walletId, Long userId, CreateAssetRequest request) {
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        if (assetRepository.findByWalletIdAndSymbol(walletId, request.symbol().toUpperCase()).isPresent()) {
            throw new BusinessException("Ativo já existe nesta carteira", "ASSET_ALREADY_EXISTS");
        }

        BigDecimal totalInvested = request.quantity().multiply(request.purchasePrice());
        BigDecimal currentPrice = request.currentPrice() != null ? request.currentPrice() : request.purchasePrice();
        BigDecimal currentValue = request.quantity().multiply(currentPrice);

        Asset asset = Asset.builder()
                .wallet(wallet)
                .symbol(request.symbol().toUpperCase())
                .name(request.name())
                .assetType(request.assetType())
                .quantity(request.quantity())
                .purchasePrice(request.purchasePrice())
                .averagePrice(request.purchasePrice())
                .currentPrice(currentPrice)
                .purchaseDate(request.purchaseDate())
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .profitLoss(currentValue.subtract(totalInvested))
                .build();

        asset.calculateProfitLoss();
        asset = assetRepository.save(asset);

        recalculateWalletTotals(wallet);
        logger.info("Asset added: {} to wallet: {}", asset.getSymbol(), walletId);

        return AssetResponse.fromEntity(asset);
    }

    @Transactional
    public AssetResponse updateAssetPrice(Long assetId, Long userId, UpdatePriceRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Ativo não encontrado"));

        validateAssetAccess(asset, userId);

        asset.setCurrentPrice(request.currentPrice());
        asset.calculateProfitLoss();
        asset = assetRepository.save(asset);

        recalculateWalletTotals(asset.getWallet());
        logger.info("Price updated for asset: {}", asset.getSymbol());

        return AssetResponse.fromEntity(asset);
    }

    @Transactional
    public TransactionResponse addTransaction(Long assetId, Long userId, CreateTransactionRequest request) {
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

        recalculateAssetFromTransactions(asset);
        recalculateWalletTotals(asset.getWallet());

        logger.info("Transaction added: {} for asset: {}", request.transactionType(), asset.getSymbol());

        return TransactionResponse.fromEntity(transaction);
    }

    private void validateAssetAccess(Asset asset, Long userId) {
        if (!asset.getWallet().getUser().getId().equals(userId)) {
            throw new BusinessException("Acesso negado", "ACCESS_DENIED");
        }
    }

    private void recalculateAssetFromTransactions(Asset asset) {
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
        BigDecimal totalSold = BigDecimal.ZERO;

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
                    totalSold = totalSold.add(t.getTotalValue());
                }
                default -> {}
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

    private void recalculateWalletTotals(Wallet wallet) {
        List<Asset> assets = assetRepository.findByWalletId(wallet.getId());

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;

        for (Asset asset : assets) {
            recalculateAssetFromTransactions(asset);
            totalInvested = totalInvested.add(asset.getTotalInvested() != null ? asset.getTotalInvested() : BigDecimal.ZERO);
            totalCurrentValue = totalCurrentValue.add(asset.getCurrentValue() != null ? asset.getCurrentValue() : BigDecimal.ZERO);
        }

        wallet.setTotalInvested(totalInvested);
        wallet.setTotalBalance(totalCurrentValue);
        wallet.setTotalProfitLoss(totalCurrentValue.subtract(totalInvested));
        walletRepository.save(wallet);
    }

    public List<AssetResponse> getWalletAssets(Long walletId, Long userId) {
        if (!walletRepository.existsByIdAndUserId(walletId, userId)) {
            throw new ResourceNotFoundException("Carteira não encontrada");
        }
        
        List<Asset> assets = assetRepository.findByWalletId(walletId);
        return assets.stream()
                .peek(this::recalculateAssetFromTransactions)
                .map(AssetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getAssetTransactions(Long assetId, Long userId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Ativo não encontrado"));

        validateAssetAccess(asset, userId);

        return transactionRepository.findByAssetIdOrderedByDateDesc(assetId).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PortfolioSummary getPortfolioSummary(Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;
        BigDecimal totalProfitLoss = BigDecimal.ZERO;

        for (Wallet wallet : wallets) {
            recalculateWalletTotals(wallet);
            totalInvested = totalInvested.add(wallet.getTotalInvested() != null ? wallet.getTotalInvested() : BigDecimal.ZERO);
            totalCurrentValue = totalCurrentValue.add(wallet.getTotalBalance() != null ? wallet.getTotalBalance() : BigDecimal.ZERO);
            totalProfitLoss = totalProfitLoss.add(wallet.getTotalProfitLoss() != null ? wallet.getTotalProfitLoss() : BigDecimal.ZERO);
        }

        BigDecimal profitPercentage = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitPercentage = totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        List<Asset> allAssets = assetRepository.findByUserId(userId);
        allAssets.forEach(this::recalculateAssetFromTransactions);
        
        Map<String, List<Asset>> byType = allAssets.stream()
                .collect(Collectors.groupingBy(a -> a.getAssetType() != null ? a.getAssetType().name() : "OTHER"));
        
        List<AssetTypeSummary> typeSummary = byType.entrySet().stream()
                .map(e -> new AssetTypeSummary(
                    e.getKey(),
                    e.getValue().stream()
                        .map(a -> a.getCurrentValue() != null ? a.getCurrentValue() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                    e.getValue().size()
                ))
                .collect(Collectors.toList());

        return new PortfolioSummary(
            totalInvested,
            totalCurrentValue,
            totalProfitLoss,
            profitPercentage,
            wallets.size(),
            allAssets.size(),
            typeSummary
        );
    }

    public record AssetTypeSummary(String type, BigDecimal totalValue, int assetCount) {}
    public record PortfolioSummary(
        BigDecimal totalInvested,
        BigDecimal totalCurrentValue,
        BigDecimal totalProfitLoss,
        BigDecimal totalProfitLossPercentage,
        int walletCount,
        int assetCount,
        List<AssetTypeSummary> byType
    ) {}
}