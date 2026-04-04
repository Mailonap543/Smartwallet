package com.smartwallet.payment;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.subscription.PlanType;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Map<String, String>>> createCheckout(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Map<String, String> request) {
        
        try {
            PlanType plan = PlanType.fromString(request.get("plan"));
            String checkoutUrl = paymentService.createCheckoutSession(user.getId(), plan);
            
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "checkoutUrl", checkoutUrl,
                "plan", plan.name()
            )));
        } catch (StripeException e) {
            throw new BusinessException("Erro ao criar sessão de pagamento: " + e.getMessage(), "PAYMENT_ERROR");
        }
    }

    @PostMapping("/portal")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPortalSession(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        try {
            String portalUrl = paymentService.createPortalSession(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("portalUrl", portalUrl)));
        } catch (StripeException e) {
            throw new BusinessException("Erro ao criar portal de cobrança: " + e.getMessage(), "PORTAL_ERROR");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubscriptionStatus(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        Map<String, Object> status = paymentService.getSubscriptionStatus(user.getId());
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}