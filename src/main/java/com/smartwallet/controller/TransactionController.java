package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.transaction.CreateTransactionRequest;
import com.smartwallet.dto.transaction.TransactionResponse;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CreateTransactionRequest request,
            @RequestParam Long assetId) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        TransactionResponse response = transactionService.createTransaction(user.getId(), assetId, request);
        return ResponseEntity.ok(ApiResponse.success("Transação registrada com sucesso", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        TransactionResponse response = transactionService.getTransactionById(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions(
            @AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        List<TransactionResponse> response = transactionService.getAllTransactionsByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactionsByAsset(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        List<TransactionResponse> response = transactionService.getTransactionsByAssetId(user.getId(), assetId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody CreateTransactionRequest request) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        TransactionResponse response = transactionService.updateTransaction(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Transação atualizada com sucesso", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        transactionService.deleteTransaction(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Transação excluída com sucesso", null));
    }
}
