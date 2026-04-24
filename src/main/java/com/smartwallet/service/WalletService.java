package com.smartwallet.service;

import com.smartwallet.dto.wallet.CreateWalletRequest;
import com.smartwallet.dto.wallet.UpdateWalletRequest;
import com.smartwallet.dto.wallet.WalletResponse;
import com.smartwallet.entity.User;
import com.smartwallet.entity.Wallet;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Transactional
    public WalletResponse createWallet(Long userId, CreateWalletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (walletRepository.countByUserId(userId) >= 10) {
            throw new BusinessException("Limite de carteiras atingido (máximo 10)", "WALLET_LIMIT_EXCEEDED");
        }

        Wallet wallet = Wallet.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .totalBalance(BigDecimal.ZERO)
                .totalInvested(BigDecimal.ZERO)
                .totalProfitLoss(BigDecimal.ZERO)
                .build();

        wallet = walletRepository.save(wallet);
        log.info("Wallet created: {} for user: {}", wallet.getId(), userId);

        return WalletResponse.fromEntity(wallet);
    }

    @Transactional(readOnly = true)
    public List<WalletResponse> getAllWalletsByUserId(Long userId) {
        validateUserExists(userId);
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        log.info("Found {} wallets for user: {}", wallets.size(), userId);
        return wallets.stream()
                .map(WalletResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public WalletResponse getWalletById(Long walletId, Long userId) {
        validateUserExists(userId);
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));
        return WalletResponse.fromEntity(wallet);
    }

    @Transactional
    public WalletResponse updateWallet(Long walletId, Long userId, UpdateWalletRequest request) {
        validateUserExists(userId);
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        wallet.setName(request.name());
        wallet.setDescription(request.description());

        wallet = walletRepository.save(wallet);
        log.info("Wallet updated: {} for user: {}", walletId, userId);

        return WalletResponse.fromEntity(wallet);
    }

    @Transactional
    public void deleteWallet(Long walletId, Long userId) {
        validateUserExists(userId);
        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        if (!wallet.getAssets().isEmpty()) {
            throw new BusinessException("Não é possível excluir carteira com ativos vinculados", "WALLET_HAS_ASSETS");
        }

        walletRepository.delete(wallet);
        log.info("Wallet deleted: {} for user: {}", walletId, userId);
    }

    @Transactional(readOnly = true)
    public boolean existsByIdAndUserId(Long walletId, Long userId) {
        return walletRepository.existsByIdAndUserId(walletId, userId);
    }

    @Transactional(readOnly = true)
    public Wallet getWalletEntityById(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));
    }

    @Transactional(readOnly = true)
    public void validateWalletAccess(Long walletId, Long userId) {
        if (!walletRepository.existsByIdAndUserId(walletId, userId)) {
            throw new BusinessException("Acesso negado à carteira", "ACCESS_DENIED");
        }
    }

    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
    }

    @Transactional
    public void recalculateWalletTotals(Wallet wallet) {
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;

        for (var asset : wallet.getAssets()) {
            totalInvested = totalInvested.add(asset.getTotalInvested() != null ? asset.getTotalInvested() : BigDecimal.ZERO);
            totalCurrentValue = totalCurrentValue.add(asset.getCurrentValue() != null ? asset.getCurrentValue() : BigDecimal.ZERO);
        }

        wallet.setTotalInvested(totalInvested);
        wallet.setTotalBalance(totalCurrentValue);
        wallet.setTotalProfitLoss(totalCurrentValue.subtract(totalInvested));
        walletRepository.save(wallet);
    }
}
