package com.smartwallet.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.text.Normalizer;
import java.util.Locale;

@Converter
public class AssetTypeConverter implements AttributeConverter<AssetType, String> {

    @Override
    public String convertToDatabaseColumn(AssetType attribute) {
        return attribute != null ? attribute.name() : AssetType.OTHER.name();
    }

    @Override
    public AssetType convertToEntityAttribute(String dbData) {
        String normalized = normalize(dbData);

        return switch (normalized) {
            case "STOCK", "ACAO", "ACOES", "ACAOES", "ACAO_BR", "ACAO B3" -> AssetType.STOCK;
            case "REIT" -> AssetType.REIT;
            case "FII", "FIIS", "FUNDO IMOBILIARIO", "FUNDOS IMOBILIARIOS" -> AssetType.FII;
            case "ETF", "ETFS" -> AssetType.ETF;
            case "BOND", "FIXED", "RENDA FIXA", "RENDA_FIXA", "TESOURO" -> AssetType.BOND;
            case "FUND", "FUNDO", "FUNDOS" -> AssetType.FUND;
            case "CRYPTO", "CRIPTO", "CRIPTOMOEDA", "CRIPTOMOEDAS" -> AssetType.CRYPTO;
            case "CASH", "CAIXA", "DINHEIRO" -> AssetType.CASH;
            default -> AssetType.OTHER;
        };
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AssetType.OTHER.name();
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
