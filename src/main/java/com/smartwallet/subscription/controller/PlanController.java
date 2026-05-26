package com.smartwallet.subscription.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.security.AuthUserResolver;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.subscription.PlanFeatures;
import com.smartwallet.subscription.PlanType;
import com.smartwallet.subscription.dto.PlanCatalogResponse;
import com.smartwallet.subscription.dto.PlanCheckoutRequest;
import com.smartwallet.subscription.dto.PlanCheckoutResponse;
import com.smartwallet.subscription.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class PlanController {

    private static final String ALLOWED_KEY = "allowed";

    private final PlanService planService;
    private final AuthUserResolver authUserResolver;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanCatalogResponse>>> getAvailablePlans() {
        List<PlanCatalogResponse> plans = planService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/my-plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyPlan() {
        CustomUserDetails user = authUserResolver.currentUser();
        Map<String, Object> planStatus = planService.getUserPlanStatus(user.getId());
        return ResponseEntity.ok(ApiResponse.success(planStatus));
    }

    @GetMapping("/features")
    public ResponseEntity<ApiResponse<PlanFeatures>> getMyPlanFeatures() {
        CustomUserDetails user = authUserResolver.currentUser();
        PlanFeatures features = planService.getUserPlanFeatures(user.getId());
        return ResponseEntity.ok(ApiResponse.success(features));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<ApiResponse<Map<String, String>>> upgradePlan(
            @RequestBody Map<String, String> request) {
        CustomUserDetails user = authUserResolver.currentUser();
        PlanType newPlan = PlanType.fromString(request.get("plan"));
        planService.upgradePlan(user.getId(), newPlan);
        
        return ResponseEntity.ok(ApiResponse.success(
            "Plano atualizado para " + newPlan.getDisplayName(),
            Map.of("plan", newPlan.name())
        ));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<PlanCheckoutResponse>> checkoutPlan(
            @RequestBody PlanCheckoutRequest request) {
        CustomUserDetails user = authUserResolver.currentUser();
        PlanCheckoutResponse response = planService.checkoutPlan(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Pagamento do plano aprovado", response));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<String>> cancelSubscription() {
        CustomUserDetails user = authUserResolver.currentUser();
        planService.cancelSubscription(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Assinatura cancelada. Plano retorna para Free."));
    }

    @GetMapping("/check/wallet")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWalletAccess() {
        CustomUserDetails user = authUserResolver.currentUser();
        try {
            planService.validateWalletCreation(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/asset")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAssetAccess() {
        CustomUserDetails user = authUserResolver.currentUser();
        try {
            planService.validateAssetCreation(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/ai")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAiAccess() {
        CustomUserDetails user = authUserResolver.currentUser();
        try {
            planService.validateAiAnalysisAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/bank")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkBankAccess() {
        CustomUserDetails user = authUserResolver.currentUser();
        try {
            planService.validateBankIntegrationAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }
}
