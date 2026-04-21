package com.smartwallet.subscription.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.subscription.PlanFeatures;
import com.smartwallet.subscription.PlanType;
import com.smartwallet.subscription.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class PlanController {

    private static final String ALLOWED_KEY = "allowed";

    private final PlanService planService;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanType>>> getAvailablePlans() {
        List<PlanType> plans = List.of(PlanType.values());
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/my-plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyPlan(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        Map<String, Object> planStatus = planService.getUserPlanStatus(user.getId());
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
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/asset")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAssetAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateAssetCreation(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/ai")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAiAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateAiAnalysisAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }

    @GetMapping("/check/bank")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkBankAccess(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            planService.validateBankIntegrationAccess(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, true)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(ALLOWED_KEY, false)));
        }
    }
}