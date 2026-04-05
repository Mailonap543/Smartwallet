package com.smartwallet.subscription.service;

import com.smartwallet.entity.User;
import com.smartwallet.subscription.PlanFeatures;
import com.smartwallet.subscription.PlanType;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final UserRepository userRepository;

    public PlanType getUserPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));
        
        return user.getPlan() != null ? user.getPlan() : PlanType.FREE;
    }

    public PlanFeatures getUserPlanFeatures(Long userId) {
        return PlanFeatures.fromPlan(getUserPlan(userId));
    }

    public void validateWalletCreation(Long userId) {
        PlanType plan = getUserPlan(userId);
        
        if (!plan.isUnlimited(plan.getMaxWallets()) && currentWallets >= plan.getMaxWallets()) {
            throw new BusinessException(
                "Limite de wallets atingido. Upgrade para " + plan.getMonthlyPrice() + " para criar mais.",
                "WALLET_LIMIT_EXCEEDED"
            );
        }
    }

    public void validateAssetCreation(Long userId) {
        PlanType plan = getUserPlan(userId);
        
        if (!plan.isUnlimited(plan.getMaxAssets()) && currentAssets >= plan.getMaxAssets()) {
            throw new BusinessException(
                "Limite de ativos atingido. Upgrade para " + plan.getMonthlyPrice() + " para adicionar mais.",
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

    public Map<String, Object> getUserPlanStatus(Long userId) {
        PlanType plan = getUserPlan(userId);
        PlanFeatures features = PlanFeatures.fromPlan(plan);
        
        return Map.of(
            "plan", plan.name(),
            "planName", plan.getDisplayName(),
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

    public void upgradePlan(Long userId, PlanType newPlan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));
        
        user.setPlan(newPlan);
        user.setPlanUpgradeDate(LocalDateTime.now());
        userRepository.save(user);
    }

    public void cancelSubscription(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));
        
        user.setPlan(PlanType.FREE);
        userRepository.save(user);
    }
}