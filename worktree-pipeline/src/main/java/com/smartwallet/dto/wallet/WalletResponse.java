package com.smartwallet.dto.wallet;

import com.smartwallet.entity.Wallet;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WalletResponse(
    Long id,
    String name,
    String description,
    BigDecimal totalBalance,
    BigDecimal totalInvested,
    BigDecimal totalProfitLoss,
    BigDecimal totalProfitLossPercentage,
    Integer assetCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static WalletResponse fromEntity(Wallet wallet) {
        BigDecimal profitPercentage = BigDecimal.ZERO;
        if (wallet.getTotalInvested() != null && wallet.getTotalInvested().compareTo(BigDecimal.ZERO) > 0) {
            profitPercentage = wallet.getTotalProfitLoss()
                    .divide(wallet.getTotalInvested(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        Integer assetCount = wallet.getAssets() != null ? wallet.getAssets().size() : 0;
        
        return new WalletResponse(
            wallet.getId(),
            wallet.getName(),
            wallet.getDescription(),
            wallet.getTotalBalance() != null ? wallet.getTotalBalance() : BigDecimal.ZERO,
            wallet.getTotalInvested() != null ? wallet.getTotalInvested() : BigDecimal.ZERO,
            wallet.getTotalProfitLoss() != null ? wallet.getTotalProfitLoss() : BigDecimal.ZERO,
            profitPercentage,
            assetCount,
            wallet.getCreatedAt(),
            wallet.getUpdatedAt()
        );
    }
}