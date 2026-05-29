package com.smartwallet.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Tipo de ativo usado para categorizar papeis e evitar Strings soltas.
 */
public enum AssetType {
    STOCK,
    REIT,
    FII,
    ETF,
    BOND,
    FUND,
    CRYPTO,
    CASH,
    OTHER;

    @JsonCreator
    public static AssetType fromValue(String value) {
        String normalized = normalize(value);

        return switch (normalized) {
            case "STOCK", "ACAO", "ACOES", "ACAOES", "ACAO BR", "ACAO B3", "SHARE", "SHARES" -> STOCK;
            case "REIT" -> REIT;
            case "FII", "FIIS", "FUNDO IMOBILIARIO", "FUNDOS IMOBILIARIOS" -> FII;
            case "ETF", "ETFS" -> ETF;
            case "BOND", "FIXED", "RENDA FIXA", "TESOURO", "TESOURO SELIC", "CDB", "LCI", "LCA" -> BOND;
            case "FUND", "FUNDO", "FUNDOS" -> FUND;
            case "CRYPTO", "CRIPTO", "CRIPTOMOEDA", "CRIPTOMOEDAS" -> CRYPTO;
            case "CASH", "CAIXA", "DINHEIRO" -> CASH;
            default -> OTHER;
        };
    }

    @JsonValue
    public String toJson() {
        return name();
    }

    private static String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER.name();
        }

        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return withoutAccents.trim()
                .replace('-', ' ')
                .replace('_', ' ')
                .replaceAll("\\s+", " ")
                .toUpperCase(Locale.ROOT);
    }
}
