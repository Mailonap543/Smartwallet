package com.smartwallet.subscription;

import java.util.List;

/**
 * Record separado para evitar conflito de múltiplos públicos em um arquivo.
 */
public record PlanFeatures(
        PlanType plan,
        int maxWallets,
        int maxAssets,
        boolean aiAnalysis,
        boolean realTimePrices,
        boolean bankIntegration,
        boolean advancedReports,
        int dataHistoryDays,
        List<String> availableFeatures
) {
    public static PlanFeatures fromPlan(PlanType plan) {
        List<String> features = new java.util.ArrayList<>();
        features.add("Dashboard básico");
        features.add("Gestão de wallets");
        features.add("Controle de ativos");

        if (plan.hasAiAnalysis()) {
            features.add("Análise de risco IA");
            features.add("Recomendações inteligentes");
            features.add("Scoring de portfólio");
        }
        if (plan.hasRealTimePrices()) {
            features.add("Preços em tempo real");
            features.add("Integração brapi.dv");
        }
        if (plan.hasBankIntegration()) {
            features.add("Integração bancária");
            features.add("Importação de extratos");
            features.add("Classificação automática");
        }
        if (plan.hasAdvancedReports()) {
            features.add("Relatórios avançados");
            features.add("Gráficos interativos");
            features.add("Análise comparativa");
        }

        return new PlanFeatures(
                plan,
                plan.getMaxWallets(),
                plan.getMaxAssets(),
                plan.hasAiAnalysis(),
                plan.hasRealTimePrices(),
                plan.hasBankIntegration(),
                plan.hasAdvancedReports(),
                plan.getDataHistoryDays(),
                features
        );
    }
}
