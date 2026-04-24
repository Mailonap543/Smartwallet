package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.wallet.CreateWalletRequest;
import com.smartwallet.dto.wallet.UpdateWalletRequest;
import com.smartwallet.dto.wallet.WalletResponse;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getAllWallets(
            @AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        List<WalletResponse> wallets = walletService.getAllWalletsByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(wallets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        WalletResponse wallet = walletService.getWalletById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CreateWalletRequest request) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        WalletResponse wallet = walletService.createWallet(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Carteira criada com sucesso", wallet));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WalletResponse>> updateWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWalletRequest request) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        WalletResponse wallet = walletService.updateWallet(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Carteira atualizada com sucesso", wallet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.success("Sessão expirada ou usuário não identificado", null));
        }
        walletService.deleteWallet(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Carteira excluída com sucesso", null));
    }
}
