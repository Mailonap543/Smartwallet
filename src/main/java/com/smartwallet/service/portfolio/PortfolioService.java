package com.smartwallet.service.portfolio;

import com.smartwallet.dto.asset.*;
import com.smartwallet.dto.transaction.*;
import com.smartwallet.dto.wallet.*;
import com.smartwallet.entity.*;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.*;
import com.smartwallet.service.TransactionService;
import com.smartwallet.service.WalletService;
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
    private static final String ASSET_NOT_FOUND = "Ativo não encontrado";

    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TransactionService transactionService;

    @Transactional
    public WalletResponse createWallet(Long userId, CreateWalletRequest request) {
        return walletService.createWallet(userId, request);
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
                .peek(wallet -> {
                    try {
                        walletService.recalculateWalletTotals(wallet);
                    } catch (Exception e) {
                        logger.error("Error recalculating wallet {}: {}", wallet.getId(), e.getMessage());
                    }
                })
                .map(WalletResponse::fromEntity)
                .toList();
    }

    public WalletResponse getWalletById(Long walletId, Long userId) {
        walletService.validateWalletAccess(walletId, userId);
        Wallet wallet = walletService.getWalletEntityById(walletId);
        walletService.recalculateWalletTotals(wallet);
        return WalletResponse.fromEntity(wallet);
    }

    @Transactional
    public AssetResponse addAsset(Long walletId, Long userId, CreateAssetRequest request) {
        walletService.validateWalletAccess(walletId, userId);
        Wallet wallet = walletService.getWalletEntityById(walletId);

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

        walletService.recalculateWalletTotals(wallet);
        logger.info("Asset added: {} to wallet: {}", asset.getSymbol(), walletId);

        return AssetResponse.fromEntity(asset);
    }

    @Transactional
    public AssetResponse updateAssetPrice(Long assetId, Long userId, UpdatePriceRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException(ASSET_NOT_FOUND));

        walletService.validateWalletAccess(asset.getWallet().getId(), userId);

        asset.setCurrentPrice(request.currentPrice());
        asset.calculateProfitLoss();
        asset = assetRepository.save(asset);

        walletService.recalculateWalletTotals(asset.getWallet());
        logger.info("Price updated for asset: {}", asset.getSymbol());

        return AssetResponse.fromEntity(asset);
    }

    @Transactional
    public TransactionResponse addTransaction(Long assetId, Long userId, CreateTransactionRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException(ASSET_NOT_FOUND));

        walletService.validateWalletAccess(asset.getWallet().getId(), userId);

        TransactionResponse response = transactionService.createTransaction(userId, assetId, request);

        transactionService.recalculateAssetFromTransactions(asset);
        walletService.recalculateWalletTotals(asset.getWallet());

        logger.info("Transaction added: {} for asset: {}", request.transactionType(), asset.getSymbol());

        return response;
    }

    public List<AssetResponse> getWalletAssets(Long walletId, Long userId) {
        walletService.validateWalletAccess(walletId, userId);
        
        List<Asset> assets = assetRepository.findByWalletId(walletId);
        return assets.stream()
                .peek(transactionService::recalculateAssetFromTransactions)
                .map(AssetResponse::fromEntity)
                .toList();
    }

    public List<TransactionResponse> getAssetTransactions(Long assetId, Long userId) {
        return transactionService.getTransactionsByAssetId(userId, assetId);
    }

    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionService.getAllTransactionsByUserId(userId);
    }

    public PortfolioSummary getPortfolioSummary(Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;
        BigDecimal totalProfitLoss = BigDecimal.ZERO;

        for (Wallet wallet : wallets) {
            walletService.recalculateWalletTotals(wallet);
            totalInvested = totalInvested.add(wallet.getTotalInvested() != null ? wallet.getTotalInvested() : BigDecimal.ZERO);
            totalCurrentValue = totalCurrentValue.add(wallet.getTotalBalance() != null ? wallet.getTotalBalance() : BigDecimal.ZERO);
            totalProfitLoss = totalProfitLoss.add(wallet.getTotalProfitLoss() != null ? wallet.getTotalProfitLoss() : BigDecimal.ZERO);
        }

        BigDecimal profitPercentage = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitPercentage = totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        List<Asset> allAssets = assetRepository.findByUserId(userId);
        allAssets.forEach(transactionService::recalculateAssetFromTransactions);
        
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
