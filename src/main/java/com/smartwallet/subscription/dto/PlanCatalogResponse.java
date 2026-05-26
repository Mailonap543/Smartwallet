package com.smartwallet.subscription.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlanCatalogResponse(
        String name,
        String displayName,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal annualPrice,
        BigDecimal annualDiscountPercent,
        int maxWallets,
        int maxAssets,
        boolean aiAnalysis,
        boolean realTimePrices,
        boolean bankIntegration,
        boolean advancedReports,
        int dataHistoryDays,
        List<String> features,
        List<String> unavailableFeatures,
        boolean highlighted,
        String accentColor,
        int displayOrder
) {}
