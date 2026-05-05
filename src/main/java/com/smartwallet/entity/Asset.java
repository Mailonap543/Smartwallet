package com.smartwallet.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Profile("!test")
@Entity(name = "LegacyAsset")
@Table(name = "portfolio_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private Wallet wallet;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 20)
    private AssetType assetType;

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal purchasePrice;

    @Column(name = "average_price", precision = 19, scale = 4)
    private BigDecimal averagePrice;

    @Column(name = "current_price", precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 8)
    private BigDecimal quantity;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "total_invested", precision = 19, scale = 4)
    private BigDecimal totalInvested;

    @Column(name = "current_value", precision = 19, scale = 4)
    private BigDecimal currentValue;

    @Column(name = "profit_loss", precision = 19, scale = 4)
    private BigDecimal profitLoss;

    @Column(name = "profit_loss_percentage", precision = 7, scale = 4)
    private BigDecimal profitLossPercentage;

    @Column(name = "day_high", precision = 19, scale = 4)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 19, scale = 4)
    private BigDecimal dayLow;

    @Column(name = "day_volume")
    private Long dayVolume;

    @Column(name = "market_cap", precision = 24, scale = 4)
    private BigDecimal marketCap;

    @Column(name = "last_quote_at")
    private LocalDateTime lastQuoteAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void calculateProfitLoss() {
        if (currentValue != null && totalInvested != null) {
            profitLoss = currentValue.subtract(totalInvested);
            if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
                profitLossPercentage = profitLoss.divide(totalInvested, 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }
    }
}
