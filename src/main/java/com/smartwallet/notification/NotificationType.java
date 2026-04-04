package com.smartwallet.notification;

import java.util.Arrays;

public enum NotificationType {
    MARKET_PRICE("market_price", "Alerta de Preço", "Preço do ativo atingiu o target"),
    MARKET_CHANGE("market_change", "Alerta de Variação", "Ativo variou acima do esperado"),
    MARKET_HIGH("market_high", "Nova Alta", "Ativo atingiu nova máxima"),
    MARKET_LOW("market_low", "Nova Baixa", "Ativo atingiu nova mínima"),
    RISK_PORTFOLIO("risk_portfolio", "Risco do Portfólio", "Risco acima do limite"),
    RISK_DRAWDOWN("risk_drawdown", "Drawdown Excessivo", "Perda acumulada acima do limite"),
    RISK_VALUE_AT_RISK("risk_var", "Value at Risk", "VaR acima do limite"),
    RISK_VOLATILITY("risk_volatility", "Volatilidade Alta", "Volatilidade elevada"),
    SUBSCRIPTION("subscription", "Assinatura", "Status da assinatura"),
    SYSTEM("system", "Sistema", "Notificação do sistema");

    private final String key;
    private final String title;
    private final String description;

    NotificationType(String key, String title, String description) {
        this.key = key;
        this.title = title;
        this.description = description;
    }

    public String getKey() { return key; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }

    public static NotificationType fromKey(String key) {
        return Arrays.stream(values())
            .filter(t -> t.key.equalsIgnoreCase(key))
            .findFirst()
            .orElse(SYSTEM);
    }
}