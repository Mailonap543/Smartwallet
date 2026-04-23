package com.smartwallet.subscription;

import java.util.Arrays;
import java.util.List;

public enum PlanType {
    FREE(
        "Free",
        "Plano gratuito com funcionalidades básicas",
        0.0,
        5,      // maxWallets
        10,     // maxAssets
        false,  // aiAnalysis
        false,  // realTimePrices
        false,  // bankIntegration
        false,  // advancedReports
        30      // dataHistoryDays
    ),
    PREMIUM(
        "Premium",
        "Plano completo com todas as funcionalidades",
        29.90,
        -1,     // unlimited wallets
        -1,     // unlimited assets
        true,   // aiAnalysis
        true,   // realTimePrices
        true,   // bankIntegration
        true,   // advancedReports
        -1      // unlimited data history
    ),
    ENTERPRISE(
        "Enterprise",
        "Para empresas com necessidades específicas",
        99.90,
        -1,
        -1,
        true,
        true,
        true,
        true,
        -1
    );

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

    PlanType(String displayName, String description, double monthlyPrice,
             int maxWallets, int maxAssets, boolean aiAnalysis,
             boolean realTimePrices, boolean bankIntegration,
             boolean advancedReports, int dataHistoryDays) {
        this.displayName = displayName;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.maxWallets = maxWallets;
        this.maxAssets = maxAssets;
        this.aiAnalysis = aiAnalysis;
        this.realTimePrices = realTimePrices;
        this.bankIntegration = bankIntegration;
        this.advancedReports = advancedReports;
        this.dataHistoryDays = dataHistoryDays;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public double getMonthlyPrice() { return monthlyPrice; }
    public int getMaxWallets() { return maxWallets; }
    public int getMaxAssets() { return maxAssets; }
    public boolean hasAiAnalysis() { return aiAnalysis; }
    public boolean hasRealTimePrices() { return realTimePrices; }
    public boolean hasBankIntegration() { return bankIntegration; }
    public boolean hasAdvancedReports() { return advancedReports; }
    public int getDataHistoryDays() { return dataHistoryDays; }

    public boolean isUnlimited(int value) { return this.maxWallets == -1 && value == -1; }

    public static PlanType fromString(String value) {
        return Arrays.stream(values())
            .filter(p -> p.name().equalsIgnoreCase(value))
            .findFirst()
            .orElse(FREE);
    }
}
