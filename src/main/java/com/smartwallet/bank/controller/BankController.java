package com.smartwallet.bank.controller;

import static com.smartwallet.bank.dto.BankDtos.*;
import com.smartwallet.bank.service.BankAggregatorService;
import com.smartwallet.bank.service.BankPaymentService;
import com.smartwallet.dto.ApiResponse;
import com.smartwallet.security.AuthUserResolver;
import com.smartwallet.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
@Slf4j
public class BankController {

    private final BankAggregatorService bankAggregatorService;
    private final BankPaymentService bankPaymentService;
    private final AuthUserResolver authUserResolver;

    @GetMapping("/institutions")
    public ResponseEntity<ApiResponse<List<Institution>>> getInstitutions() {
        List<Institution> institutions = bankAggregatorService.getAvailableInstitutions();
        return ResponseEntity.ok(ApiResponse.success(institutions));
    }

    @PostMapping("/connect")
    public ResponseEntity<ApiResponse<BankConnectionResponse>> connectBank(
            @RequestBody BankConnectionRequest request) {
        CustomUserDetails user = authUserResolver.currentUser();
        if (!bankAggregatorService.isEnabled()) {
            return ResponseEntity.ok(ApiResponse.error("Bank integration not enabled"));
        }

        String callbackUrl = "/api/bank/callback?userId=" + user.getId();
        
        return bankAggregatorService.createConnectionLink(
                request.institutionId(),
                callbackUrl,
                user.getId().toString()
        )
        .map(response -> ResponseEntity.ok(ApiResponse.success("Bank connection initiated", response)))
        .orElse(ResponseEntity.ok(ApiResponse.error("Failed to initiate bank connection")));
    }

    @GetMapping("/callback")
    public ResponseEntity<ApiResponse<Map<String, String>>> handleCallback(
            @RequestParam("code") String code,
            @RequestParam("session_id") String sessionId,
            @RequestParam("userId") Long userId) {
        
        return bankAggregatorService.exchangeCodeForToken(code)
                .map(token -> {
                    log.info("Token exchanged successfully for user: {}", userId);
                    return ResponseEntity.ok(ApiResponse.success(Map.of(
                        "status", "connected",
                        "sessionId", sessionId,
                        "userId", userId.toString()
                    )));
                })
                .orElse(ResponseEntity.ok(ApiResponse.error("Failed to complete bank connection")));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> disconnectBank(
            @RequestBody Map<String, String> request) {
        authUserResolver.currentUser();
        String accessToken = request.get("accessToken");
        boolean disconnected = bankAggregatorService.disconnectAccount(accessToken);
        
        if (disconnected) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("disconnected", true)));
        }
        return ResponseEntity.ok(ApiResponse.error("Failed to disconnect bank"));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "enabled", bankAggregatorService.isEnabled(),
            "service", "bank_aggregator",
            "mockPayments", true
        )));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @RequestBody PaymentRequest request) {
        CustomUserDetails user = authUserResolver.currentUser();
        PaymentResponse response = bankPaymentService.createPayment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Pagamento criado com sucesso", response));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPayments() {
        CustomUserDetails user = authUserResolver.currentUser();
        List<PaymentResponse> response = bankPaymentService.getUserPayments(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
