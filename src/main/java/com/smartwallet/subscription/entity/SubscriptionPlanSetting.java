package com.smartwallet.subscription.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plan_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_name", nullable = false, unique = true, length = 30)
    private String planName;

    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "annual_discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal annualDiscountPercent;

    @Builder.Default
    @Column(name = "highlighted", nullable = false)
    private Boolean highlighted = false;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "accent_color", length = 20)
    private String accentColor;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (annualDiscountPercent == null) annualDiscountPercent = BigDecimal.ZERO;
        if (highlighted == null) highlighted = false;
        if (displayOrder == null) displayOrder = 0;
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
