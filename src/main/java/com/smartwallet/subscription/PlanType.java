package com.smartwallet.subscription;

import lombok.Builder;
import lombok.Getter;

public enum PlanType {
    FREE(
        PlanDetails.builder()
            .displayName("Free")
            .description("Plano gratuito com funcionalidades básicas")
            .monthlyPrice(0.0)
            .maxWallets(5)
            .maxAssets(10)
            .aiAnalysis(false)
            .realTimePrices(false)
            .bankIntegration(false)
            .advancedReports(false)
            .dataHistoryDays(30)
            .build()
    ),
    PREMIUM(
        PlanDetails.builder()
            .displayName("Premium")
            .description("Plano completo com todas as funcionalidades")
            .monthlyPrice(29.90)
            .maxWallets(-1)
            .maxAssets(-1)
            .aiAnalysis(true)
            .realTimePrices(true)
            .bankIntegration(true)
            .advancedReports(true)
            .dataHistoryDays(-1)
            .build()
    ),
    ENTERPRISE(
        PlanDetails.builder()
            .displayName("Enterprise")
            .description("Para empresas com necessidades específicas")
            .monthlyPrice(99.90)
            .maxWallets(-1)
            .maxAssets(-1)
            .aiAnalysis(true)
            .realTimePrices(true)
            .bankIntegration(true)
            .advancedReports(true)
            .dataHistoryDays(-1)
            .build()
    );

    private final PlanDetails details;

    PlanType(PlanDetails details) {
        this.details = details;
    }

    public String getDisplayName() { return details.displayName; }
    public String getDescription() { return details.description; }
    public double getMonthlyPrice() { return details.monthlyPrice; }
    public int getMaxWallets() { return details.maxWallets; }
    public int getMaxAssets() { return details.maxAssets; }
    public boolean hasAiAnalysis() { return details.aiAnalysis; }
    public boolean hasRealTimePrices() { return details.realTimePrices; }
    public boolean hasBankIntegration() { return details.bankIntegration; }
    public boolean hasAdvancedReports() { return details.advancedReports; }
    public int getDataHistoryDays() { return details.dataHistoryDays; }

    public boolean isUnlimited(int value) { return this.details.maxWallets == -1 && value == -1; }

    public static PlanType fromString(String value) {
        return java.util.Arrays.stream(values())
            .filter(p -> p.name().equalsIgnoreCase(value))
            .findFirst()
            .orElse(FREE);
    }

    @Getter
    @Builder
    private static class PlanDetails {
        private final String displayName;
        private final String description;
        private final double monthlyPrice;
        private final int maxWallets;
        private final int maxAssets;
        private final boolean aiAnalysis;
        private final boolean realTimePrices;
        private final boolean bankIntegration;
        private final boolean advancedReports;
        private final int dataHistoryDays;
    }
}
