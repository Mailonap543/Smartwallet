package com.smartwallet.config.dev;

import com.smartwallet.entity.Asset;
import com.smartwallet.entity.AssetType;
import com.smartwallet.entity.Transaction;
import com.smartwallet.entity.User;
import com.smartwallet.entity.Wallet;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.repository.TransactionRepository;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.repository.WalletRepository;
import com.smartwallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "smartwallet.seed.passive-income",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class PassiveIncomePortfolioSeeder implements ApplicationRunner {

    private static final String WALLET_NAME = "Carteira Renda Passiva Teste";
    private static final String WALLET_DESCRIPTION = """
            Carteira de teste para validar fluxo completo do SmartWallet:
            ativos, dashboard, transacoes, IA, renda mensal estimada e carteira.
            Renda mensal estimada: R$ 82,50. Renda anual estimada: R$ 990,00.
            Yield mensal medio: 0,825%. Yield anual medio: 9,90%.
            """;

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @Value("${smartwallet.seed.passive-income.user-email:}")
    private String targetUserEmail;

    @Value("${smartwallet.seed.passive-income.reset-on-start:true}")
    private boolean resetOnStart;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<User> users = targetUsers();
        if (users.isEmpty()) {
            log.info("Passive income seed skipped: no active users found");
            return;
        }

        users.forEach(this::seedForUser);
    }

    private List<User> targetUsers() {
        if (hasText(targetUserEmail)) {
            return userRepository.findByEmail(targetUserEmail.trim())
                    .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                    .map(List::of)
                    .orElseGet(List::of);
        }

        return userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .toList();
    }

    private void seedForUser(User user) {
        Wallet wallet = walletRepository.findByUserId(user.getId()).stream()
                .filter(candidate -> WALLET_NAME.equalsIgnoreCase(candidate.getName()))
                .findFirst()
                .orElseGet(() -> createWallet(user));

        if (!resetOnStart && !assetRepository.findByWalletId(wallet.getId()).isEmpty()) {
            log.info("Passive income seed skipped for {}: wallet already has assets", user.getEmail());
            return;
        }

        clearWalletAssets(wallet);
        LocalDate purchaseDate = LocalDate.now().minusDays(30);

        for (SeedAsset item : seedAssets()) {
            Asset asset = createAsset(wallet, item, purchaseDate);
            createBuyTransaction(asset, item, purchaseDate.atStartOfDay());
            createDividendTransaction(asset, item, LocalDate.now().atStartOfDay());
        }

        wallet.setDescription(WALLET_DESCRIPTION);
        walletService.recalculateWalletTotals(wallet);
        log.info("Passive income test wallet seeded for user {} with {} assets", user.getEmail(), seedAssets().size());
    }

    private Wallet createWallet(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .name(WALLET_NAME)
                .description(WALLET_DESCRIPTION)
                .totalBalance(BigDecimal.ZERO)
                .totalInvested(BigDecimal.ZERO)
                .totalProfitLoss(BigDecimal.ZERO)
                .build();
        return walletRepository.save(wallet);
    }

    private void clearWalletAssets(Wallet wallet) {
        List<Asset> existingAssets = assetRepository.findByWalletId(wallet.getId());
        for (Asset asset : existingAssets) {
            transactionRepository.deleteAll(transactionRepository.findByAssetIdOrderedByDateDesc(asset.getId()));
        }
        transactionRepository.flush();
        assetRepository.deleteAll(existingAssets);
        assetRepository.flush();
    }

    private Asset createAsset(Wallet wallet, SeedAsset item, LocalDate purchaseDate) {
        BigDecimal currentValue = item.quantity().multiply(item.averagePrice());
        Asset asset = Asset.builder()
                .wallet(wallet)
                .symbol(item.symbol())
                .name(item.name())
                .assetType(item.assetType())
                .quantity(item.quantity())
                .purchasePrice(item.averagePrice())
                .averagePrice(item.averagePrice())
                .currentPrice(item.averagePrice())
                .purchaseDate(purchaseDate)
                .totalInvested(item.investedValue())
                .currentValue(currentValue)
                .profitLoss(currentValue.subtract(item.investedValue()))
                .profitLossPercentage(BigDecimal.ZERO)
                .build();
        return assetRepository.save(asset);
    }

    private void createBuyTransaction(Asset asset, SeedAsset item, LocalDateTime transactionDate) {
        BigDecimal totalValue = item.quantity().multiply(item.averagePrice());
        Transaction transaction = Transaction.builder()
                .asset(asset)
                .transactionType(Transaction.TransactionType.BUY)
                .quantity(item.quantity())
                .price(item.averagePrice())
                .totalValue(totalValue)
                .fees(BigDecimal.ZERO)
                .totalWithFees(totalValue)
                .transactionDate(transactionDate)
                .notes("Seed dev: compra inicial da carteira de renda passiva")
                .build();
        transactionRepository.save(transaction);
    }

    private void createDividendTransaction(Asset asset, SeedAsset item, LocalDateTime transactionDate) {
        BigDecimal unitIncome = item.monthlyIncome()
                .divide(item.quantity(), 8, RoundingMode.HALF_UP);
        Transaction transaction = Transaction.builder()
                .asset(asset)
                .transactionType(Transaction.TransactionType.DIVIDEND)
                .quantity(item.quantity())
                .price(unitIncome)
                .totalValue(item.monthlyIncome())
                .fees(BigDecimal.ZERO)
                .totalWithFees(item.monthlyIncome())
                .transactionDate(transactionDate)
                .notes("Seed dev: renda mensal estimada; yield mensal " + item.monthlyYield() + "%")
                .build();
        transactionRepository.save(transaction);
    }

    private List<SeedAsset> seedAssets() {
        return List.of(
                new SeedAsset("MXRF11", "Maxi Renda", AssetType.FII, bd("100"), bd("10.00"), bd("1000.00"), bd("10.00"), bd("1.00")),
                new SeedAsset("HGLG11", "CSHG Logistica", AssetType.FII, bd("10"), bd("160.00"), bd("1600.00"), bd("11.20"), bd("0.70")),
                new SeedAsset("KNRI11", "Kinea Renda Imobiliaria", AssetType.FII, bd("10"), bd("150.00"), bd("1500.00"), bd("10.50"), bd("0.70")),
                new SeedAsset("VISC11", "Vinci Shopping Centers", AssetType.FII, bd("10"), bd("110.00"), bd("1100.00"), bd("8.80"), bd("0.80")),
                new SeedAsset("BBAS3", "Banco do Brasil", AssetType.STOCK, bd("50"), bd("28.00"), bd("1400.00"), bd("11.60"), bd("0.83")),
                new SeedAsset("TAEE11", "Taesa", AssetType.STOCK, bd("30"), bd("35.00"), bd("1050.00"), bd("9.50"), bd("0.90")),
                new SeedAsset("ITSA4", "Itausa", AssetType.STOCK, bd("100"), bd("10.00"), bd("1000.00"), bd("6.50"), bd("0.65")),
                new SeedAsset("TESOURO_SELIC", "Tesouro Selic", AssetType.BOND, bd("1"), bd("850.00"), bd("850.00"), bd("6.40"), bd("0.75")),
                new SeedAsset("CDB_110_CDI", "CDB 110% CDI", AssetType.BOND, bd("1"), bd("500.00"), bd("500.00"), bd("4.00"), bd("0.80"))
        );
    }

    private BigDecimal bd(String value) {
        return new BigDecimal(value);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record SeedAsset(
            String symbol,
            String name,
            AssetType assetType,
            BigDecimal quantity,
            BigDecimal averagePrice,
            BigDecimal investedValue,
            BigDecimal monthlyIncome,
            BigDecimal monthlyYield
    ) {
    }
}
