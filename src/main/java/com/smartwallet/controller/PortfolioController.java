package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.asset.*;
import com.smartwallet.dto.payment.AssetPaymentRequest;
import com.smartwallet.dto.payment.AssetPaymentResponse;
import com.smartwallet.dto.transaction.*;
import com.smartwallet.dto.wallet.*;
import com.smartwallet.security.AuthUserResolver;
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
    private final AuthUserResolver authUserResolver;

    @PostMapping("/wallets")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CreateWalletRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        WalletResponse response = portfolioService.createWallet(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Carteira criada com sucesso", response));
    }

    @GetMapping("/wallets")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getWallets(
            @AuthenticationPrincipal CustomUserDetails user) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        List<WalletResponse> response = portfolioService.getUserWallets(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/wallets/{walletId}")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        WalletResponse response = portfolioService.getWalletById(walletId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/wallets/{walletId}/assets")
    public ResponseEntity<ApiResponse<AssetResponse>> addAsset(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId,
            @Valid @RequestBody CreateAssetRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        AssetResponse response = portfolioService.addAsset(walletId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Ativo adicionado com sucesso", response));
    }

    @GetMapping("/wallets/{walletId}/assets")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getWalletAssets(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        List<AssetResponse> response = portfolioService.getWalletAssets(walletId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/wallets/{walletId}/asset-payments")
    public ResponseEntity<ApiResponse<AssetPaymentResponse>> payAssetPurchase(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long walletId,
            @Valid @RequestBody AssetPaymentRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        AssetPaymentResponse response = portfolioService.payAssetPurchase(walletId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Compra de ação paga com sucesso", response));
    }

    @PutMapping("/assets/{assetId}/price")
    public ResponseEntity<ApiResponse<AssetResponse>> updatePrice(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId,
            @Valid @RequestBody UpdatePriceRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        AssetResponse response = portfolioService.updateAssetPrice(assetId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Preço atualizado com sucesso", response));
    }

    @PutMapping("/assets/{assetId}")
    public ResponseEntity<ApiResponse<AssetResponse>> updateAsset(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId,
            @Valid @RequestBody UpdateAssetRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        AssetResponse response = portfolioService.updateAsset(assetId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Ativo atualizado com sucesso", response));
    }

    @PostMapping("/assets/{assetId}/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> addTransaction(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId,
            @Valid @RequestBody CreateTransactionRequest request) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        TransactionResponse response = portfolioService.addTransaction(assetId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transação registrada com sucesso", response));
    }

    @GetMapping("/assets/{assetId}/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAssetTransactions(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long assetId) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        List<TransactionResponse> response = portfolioService.getAssetTransactions(assetId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getUserTransactions(
            @AuthenticationPrincipal CustomUserDetails user) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        List<TransactionResponse> response = portfolioService.getUserTransactions(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PortfolioService.PortfolioSummary>> getPortfolioSummary(
            @AuthenticationPrincipal CustomUserDetails user) {
        CustomUserDetails currentUser = authUserResolver.currentUser();
        PortfolioService.PortfolioSummary response = portfolioService.getPortfolioSummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
