package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.asset.*;
import com.smartwallet.dto.transaction.*;
import com.smartwallet.dto.wallet.*;
import com.smartwallet.security.CustomUserDetails;
import com.smartwallet.service.portfolio.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping("/wallets")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CreateWalletRequest request) {
        WalletResponse response = portfolioService.createWallet(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Carteira criada com sucesso", response));
    }

    @GetMapping("/wallets")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getWallets(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<WalletResponse> response = portfolioService.getUserWallets(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/wallets/{walletId}")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId) {
        WalletResponse response = portfolioService.getWalletById(walletId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/wallets/{walletId}/assets")
    public ResponseEntity<ApiResponse<AssetResponse>> addAsset(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId,
            @Valid @RequestBody CreateAssetRequest request) {
        AssetResponse response = portfolioService.addAsset(walletId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Ativo adicionado com sucesso", response));
    }

    @GetMapping("/wallets/{walletId}/assets")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getWalletAssets(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId) {
        List<AssetResponse> response = portfolioService.getWalletAssets(walletId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/assets/{assetId}/price")
    public ResponseEntity<ApiResponse<AssetResponse>> updatePrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId,
            @Valid @RequestBody UpdatePriceRequest request) {
        AssetResponse response = portfolioService.updateAssetPrice(assetId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Preço atualizado com sucesso", response));
    }

    @PostMapping("/assets/{assetId}/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> addTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId,
            @Valid @RequestBody CreateTransactionRequest request) {
        TransactionResponse response = portfolioService.addTransaction(assetId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transação registrada com sucesso", response));
    }

    @GetMapping("/assets/{assetId}/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAssetTransactions(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId) {
        List<TransactionResponse> response = portfolioService.getAssetTransactions(assetId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getUserTransactions(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<TransactionResponse> response = portfolioService.getUserTransactions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PortfolioService.PortfolioSummary>> getPortfolioSummary(
            @AuthenticationPrincipal CustomUserDetails user) {
        PortfolioService.PortfolioSummary response = portfolioService.getPortfolioSummary(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}