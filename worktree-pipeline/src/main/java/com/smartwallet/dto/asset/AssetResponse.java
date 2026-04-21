package com.smartwallet.dto.asset;

import com.smartwallet.entity.Asset;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AssetResponse(
    Long id,
    String symbol,
    String name,
    String assetType,
    BigDecimal quantity,
    BigDecimal purchasePrice,
    BigDecimal averagePrice,
    BigDecimal currentPrice,
    BigDecimal totalInvested,
    BigDecimal currentValue,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage,
    LocalDate purchaseDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static AssetResponse fromEntity(Asset asset) {
        return new AssetResponse(
            asset.getId(),
            asset.getSymbol(),
            asset.getName(),
            asset.getAssetType() != null ? asset.getAssetType().name() : null,
            asset.getQuantity(),
            asset.getPurchasePrice(),
            asset.getAveragePrice(),
            asset.getCurrentPrice(),
            asset.getTotalInvested() != null ? asset.getTotalInvested() : BigDecimal.ZERO,
            asset.getCurrentValue() != null ? asset.getCurrentValue() : BigDecimal.ZERO,
            asset.getProfitLoss() != null ? asset.getProfitLoss() : BigDecimal.ZERO,
            asset.getProfitLossPercentage() != null ? asset.getProfitLossPercentage() : BigDecimal.ZERO,
            asset.getPurchaseDate(),
            asset.getCreatedAt(),
            asset.getUpdatedAt()
        );
    }
}