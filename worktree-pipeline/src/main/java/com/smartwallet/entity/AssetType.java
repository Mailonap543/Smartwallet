package com.smartwallet.entity;

/**
 * Tipo de ativo usado para categorizar papeis e evitar Strings soltas.
 */
public enum AssetType {
    STOCK,
    REIT,
    ETF,
    BOND,
    FUND,
    CRYPTO,
    CASH,
    OTHER
}
