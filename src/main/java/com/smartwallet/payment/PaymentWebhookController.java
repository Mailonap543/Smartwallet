package com.smartwallet.payment;

import com.smartwallet.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processado");
        } catch (BusinessException e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected webhook error", e);
            return ResponseEntity.internalServerError().body("Erro ao processar webhook");
        }
    }
}