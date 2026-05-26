package com.smartwallet.subscription.service;

import com.smartwallet.bank.dto.BankDtos;
import com.smartwallet.bank.dto.BankDtos.PaymentRequest;
import com.smartwallet.bank.service.BankPaymentService;
import com.smartwallet.entity.User;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.repository.WalletRepository;
import com.smartwallet.subscription.PlanFeatures;
import com.smartwallet.subscription.PlanType;
import com.smartwallet.subscription.dto.AdminPlanUpdateRequest;
import com.smartwallet.subscription.dto.PlanCatalogResponse;
import com.smartwallet.subscription.dto.PlanCheckoutRequest;
import com.smartwallet.subscription.dto.PlanCheckoutResponse;
import com.smartwallet.subscription.entity.SubscriptionPlanSetting;
import com.smartwallet.subscription.repository.SubscriptionPlanSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlanService {

    private static final BigDecimal MONTHS_IN_YEAR = BigDecimal.valueOf(12);
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;
    private final SubscriptionPlanSettingRepository planSettingRepository;
    private final BankPaymentService bankPaymentService;

    public PlanType getUserPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        return user.getPlan() != null ? user.getPlan() : PlanType.FREE;
    }

    public PlanFeatures getUserPlanFeatures(Long userId) {
        return PlanFeatures.fromPlan(getUserPlan(userId));
    }

    @Transactional(readOnly = true)
    public List<PlanCatalogResponse> getAvailablePlans() {
        return Arrays.stream(PlanType.values())
                .map(this::getPlanCatalog)
                .filter(plan -> getSetting(PlanType.fromString(plan.name())).getActive())
                .sorted(java.util.Comparator.comparingInt(PlanCatalogResponse::displayOrder))
                .toList();
    }

    @Transactional(readOnly = true)
    public PlanCatalogResponse getPlanCatalog(PlanType plan) {
        SubscriptionPlanSetting setting = getSetting(plan);
        BigDecimal monthlyPrice = setting.getMonthlyPrice();
        BigDecimal annualDiscount = setting.getAnnualDiscountPercent();
        BigDecimal annualPrice = monthlyPrice
                .multiply(MONTHS_IN_YEAR)
                .multiply(ONE_HUNDRED.subtract(annualDiscount))
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        PlanFeatures features = PlanFeatures.fromPlan(plan);
        return new PlanCatalogResponse(
                plan.name(),
                setting.getDisplayName(),
                setting.getDescription(),
                monthlyPrice,
                annualPrice,
                annualDiscount,
                plan.getMaxWallets(),
                plan.getMaxAssets(),
                plan.hasAiAnalysis(),
                plan.hasRealTimePrices(),
                plan.hasBankIntegration(),
                plan.hasAdvancedReports(),
                plan.getDataHistoryDays(),
                features.availableFeatures(),
                unavailableFeatures(plan),
                Boolean.TRUE.equals(setting.getHighlighted()),
                setting.getAccentColor(),
                setting.getDisplayOrder()
        );
    }

    @Transactional
    public PlanCatalogResponse updatePlanSettings(String planName, AdminPlanUpdateRequest request) {
        PlanType plan = PlanType.fromString(planName);
        SubscriptionPlanSetting setting = planSettingRepository.findByPlanName(plan.name())
                .orElseGet(() -> defaultSetting(plan));

        if (request.displayName() != null && !request.displayName().isBlank()) {
            setting.setDisplayName(request.displayName());
        }
        if (request.description() != null && !request.description().isBlank()) {
            setting.setDescription(request.description());
        }
        if (request.monthlyPrice() != null) {
            if (request.monthlyPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("Preço do plano não pode ser negativo", "INVALID_PLAN_PRICE");
            }
            setting.setMonthlyPrice(request.monthlyPrice());
        }
        if (request.annualDiscountPercent() != null) {
            if (request.annualDiscountPercent().compareTo(BigDecimal.ZERO) < 0
                    || request.annualDiscountPercent().compareTo(BigDecimal.valueOf(90)) > 0) {
                throw new BusinessException("Desconto anual deve ficar entre 0% e 90%", "INVALID_PLAN_DISCOUNT");
            }
            setting.setAnnualDiscountPercent(request.annualDiscountPercent());
        }
        if (request.highlighted() != null) {
            setting.setHighlighted(request.highlighted());
        }
        if (request.accentColor() != null && !request.accentColor().isBlank()) {
            setting.setAccentColor(request.accentColor());
        }
        if (request.active() != null) {
            setting.setActive(request.active());
        }

        planSettingRepository.save(setting);
        return getPlanCatalog(plan);
    }

    public void validateWalletCreation(Long userId) {
        PlanType plan = getUserPlan(userId);
        int currentWallets = (int) walletRepository.countByUserId(userId);

        if (!plan.isUnlimited(plan.getMaxWallets()) && currentWallets >= plan.getMaxWallets()) {
            throw new BusinessException(
                "Limite de carteiras atingido. Faça upgrade para criar mais.",
                "WALLET_LIMIT_EXCEEDED"
            );
        }
    }

    public void validateAssetCreation(Long userId) {
        PlanType plan = getUserPlan(userId);
        int currentAssets = (int) assetRepository.countByUserId(userId);

        if (!plan.isUnlimited(plan.getMaxAssets()) && currentAssets >= plan.getMaxAssets()) {
            throw new BusinessException(
                "Limite de ativos atingido. Faça upgrade para adicionar mais.",
                "ASSET_LIMIT_EXCEEDED"
            );
        }
    }

    public void validateAiAnalysisAccess(Long userId) {
        PlanType plan = getUserPlan(userId);
        if (!plan.hasAiAnalysis()) {
            throw new BusinessException(
                "Funcionalidade disponível apenas no plano Premium",
                "FEATURE_NOT_IN_PLAN"
            );
        }
    }

    public void validateRealTimePricesAccess(Long userId) {
        PlanType plan = getUserPlan(userId);
        if (!plan.hasRealTimePrices()) {
            throw new BusinessException(
                "Preços em tempo real disponíveis apenas no plano Premium",
                "FEATURE_NOT_IN_PLAN"
            );
        }
    }

    public void validateBankIntegrationAccess(Long userId) {
        PlanType plan = getUserPlan(userId);
        if (!plan.hasBankIntegration()) {
            throw new BusinessException(
                "Integração bancária disponível apenas no plano Premium",
                "FEATURE_NOT_IN_PLAN"
            );
        }
    }

    public void validateAdvancedReportsAccess(Long userId) {
        PlanType plan = getUserPlan(userId);
        if (!plan.hasAdvancedReports()) {
            throw new BusinessException(
                "Relatórios avançados disponíveis apenas no plano Premium",
                "FEATURE_NOT_IN_PLAN"
            );
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserPlanStatus(Long userId) {
        PlanType plan = getUserPlan(userId);
        PlanFeatures features = PlanFeatures.fromPlan(plan);
        PlanCatalogResponse catalog = getPlanCatalog(plan);

        return Map.of(
            "plan", plan.name(),
            "planName", catalog.displayName(),
            "monthlyPrice", catalog.monthlyPrice(),
            "annualPrice", catalog.annualPrice(),
            "annualDiscountPercent", catalog.annualDiscountPercent(),
            "features", features.availableFeatures(),
            "limits", Map.of(
                "wallets", plan.getMaxWallets(),
                "assets", plan.getMaxAssets(),
                "dataHistoryDays", plan.getDataHistoryDays()
            ),
            "permissions", Map.of(
                "aiAnalysis", plan.hasAiAnalysis(),
                "realTimePrices", plan.hasRealTimePrices(),
                "bankIntegration", plan.hasBankIntegration(),
                "advancedReports", plan.hasAdvancedReports()
            )
        );
    }

    @Transactional
    public PlanCheckoutResponse checkoutPlan(Long userId, PlanCheckoutRequest request) {
        PlanType plan = PlanType.fromString(request.plan());
        PlanCatalogResponse catalog = getPlanCatalog(plan);
        String billingCycle = normalizeBillingCycle(request.billingCycle());
        BigDecimal amount = "ANNUAL".equals(billingCycle) ? catalog.annualPrice() : catalog.monthlyPrice();

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            upgradePlan(userId, plan);
            return new PlanCheckoutResponse(catalog, null, billingCycle, amount);
        }

        BankDtos.PaymentResponse payment = bankPaymentService.createPayment(userId, new PaymentRequest(
                request.institutionId(),
                amount,
                "BRL",
                "PIX",
                null,
                "Smartwallet Assinaturas",
                "Assinatura " + catalog.displayName() + " - " + billingCycle.toLowerCase(),
                "SUBSCRIPTION_PLAN",
                plan.name()
        ));

        if ("APPROVED".equalsIgnoreCase(payment.status())) {
            upgradePlan(userId, plan);
        }

        return new PlanCheckoutResponse(catalog, payment, billingCycle, amount);
    }

    @Transactional
    public void upgradePlan(Long userId, PlanType newPlan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        user.setPlan(newPlan);
        user.setPlanUpgradeDate(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void cancelSubscription(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        user.setPlan(PlanType.FREE);
        userRepository.save(user);
    }

    private SubscriptionPlanSetting getSetting(PlanType plan) {
        return planSettingRepository.findByPlanName(plan.name())
                .orElseGet(() -> defaultSetting(plan));
    }

    private SubscriptionPlanSetting defaultSetting(PlanType plan) {
        return SubscriptionPlanSetting.builder()
                .planName(plan.name())
                .displayName(defaultDisplayName(plan))
                .description(defaultDescription(plan))
                .monthlyPrice(defaultMonthlyPrice(plan))
                .annualDiscountPercent(defaultAnnualDiscount(plan))
                .highlighted(plan == PlanType.PREMIUM)
                .displayOrder(plan.ordinal() + 1)
                .accentColor(plan == PlanType.FREE ? "#009DFF" : plan == PlanType.PREMIUM ? "#7C3AED" : "#00D6B4")
                .active(true)
                .build();
    }

    private String defaultDisplayName(PlanType plan) {
        return switch (plan) {
            case FREE -> "Free";
            case PREMIUM -> "Premium";
            case ENTERPRISE -> "Ultimate";
        };
    }

    private String defaultDescription(PlanType plan) {
        return switch (plan) {
            case FREE -> "Plano gratuito para testar a carteira, organizar ativos e acompanhar o mercado.";
            case PREMIUM -> "Recursos avançados com IA para análises mais profundas e melhores decisões.";
            case ENTERPRISE -> "Experiência completa com máxima tecnologia, segurança e suporte exclusivo.";
        };
    }

    private BigDecimal defaultMonthlyPrice(PlanType plan) {
        return switch (plan) {
            case FREE -> BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            case PREMIUM -> BigDecimal.valueOf(59.90).setScale(2, RoundingMode.HALF_UP);
            case ENTERPRISE -> BigDecimal.valueOf(99.90).setScale(2, RoundingMode.HALF_UP);
        };
    }

    private BigDecimal defaultAnnualDiscount(PlanType plan) {
        return plan == PlanType.FREE ? BigDecimal.ZERO : BigDecimal.valueOf(20);
    }

    private List<String> unavailableFeatures(PlanType plan) {
        if (plan == PlanType.FREE) {
            return List.of("Inteligência Artificial avançada", "Recomendações personalizadas", "Análises aprofundadas", "Gestão de risco avançada");
        }
        if (plan == PlanType.PREMIUM) {
            return List.of("Gestão de risco avançada institucional");
        }
        return List.of();
    }

    private String normalizeBillingCycle(String billingCycle) {
        return "ANNUAL".equalsIgnoreCase(billingCycle) || "ANUAL".equalsIgnoreCase(billingCycle) ? "ANNUAL" : "MONTHLY";
    }
}
