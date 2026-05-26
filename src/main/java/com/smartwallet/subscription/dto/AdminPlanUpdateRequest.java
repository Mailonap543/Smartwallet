package com.smartwallet.subscription.dto;

import java.math.BigDecimal;

public record AdminPlanUpdateRequest(
        String displayName,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal annualDiscountPercent,
        Boolean highlighted,
        String accentColor,
        Boolean active
) {}
