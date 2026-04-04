package com.smartwallet.subscription;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.payment.PaymentService;
import com.smartwallet.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class PlanControllerIntegration {

    private final PlanService planService;
    private final PaymentService paymentService;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanType>>> getAvailablePlans() {
        List<PlanType> plans = List.of(PlanType.values());
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/my-plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyPlan(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        Map<String, Object> planStatus = planService.getUserPlanStatus(user.getId());
        
        if (paymentService != null) {
            try {
                Map<String, Object> paymentStatus = paymentService.getSubscriptionStatus(user.getId());
                planStatus.put("payment", paymentStatus);
            } catch (Exception e) {
                planStatus.put("payment", Map.of("status", "unavailable"));
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(planStatus));
    }

    @GetMapping("/features")
    public ResponseEntity<ApiResponse<PlanFeatures>> getMyPlanFeatures(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        PlanFeatures features = planService.getUserPlanFeatures(user.getId());
        return ResponseEntity.ok(ApiResponse.success(features));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<ApiResponse<Map<String, String>>> upgradePlan(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Map<String, String> request) {
        
        PlanType newPlan = PlanType.fromString(request.get("plan"));
        
        if (newPlan == PlanType.FREE) {
            planService.cancelSubscription(user.getId());
            return ResponseEntity.ok(ApiResponse.success(
                "Plano atualizado para Free",
                Map.of("plan", "FREE")
            ));
        }
        
        if (paymentService != null) {
            try {
                String checkoutUrl = paymentService.createCheckoutSession(user.getId(), newPlan);
                return ResponseEntity.ok(ApiResponse.success(
                    "Redirecionando para pagamento",
                    Map.of("checkoutUrl", checkoutUrl, "plan", newPlan.name())
                ));
            } catch (Exception e) {
                throw new BusinessException("Erro ao processar pagamento: " + e.getMessage(), "PAYMENT_ERROR");
            }
        }
        
        planService.upgradePlan(user.getId(), newPlan);
        return ResponseEntity.ok(ApiResponse.success(
            "Plano atualizado para " + newPlan.getDisplayName(),
            Map.of("plan", newPlan.name())
        ));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<String>> cancelSubscription(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        planService.cancelSubscription(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Assinatura cancelada. Plano retorna para Free."));
    }

    @GetMapping("/check/wallet")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWalletAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateWalletCreation(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", false)));
        }
    }

    @GetMapping("/check/asset")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAssetAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateAssetCreation(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", false)));
        }
    }

    @GetMapping("/check/ai")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAiAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateAiAnalysisAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", false)));
        }
    }

    @GetMapping("/check/bank")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkBankAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateBankIntegrationAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("allowed", false)));
        }
    }
}