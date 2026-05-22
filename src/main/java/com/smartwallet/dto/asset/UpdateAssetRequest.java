package com.smartwallet.dto.asset;

import com.smartwallet.entity.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateAssetRequest(
    @NotBlank(message = "Simbolo e obrigatorio")
    String symbol,

    @NotBlank(message = "Nome e obrigatorio")
    String name,

    @NotNull(message = "Tipo de ativo e obrigatorio")
    AssetType assetType,

    @NotNull(message = "Quantidade e obrigatoria")
    @Positive(message = "Quantidade deve ser positiva")
    BigDecimal quantity,

    @NotNull(message = "Preco de compra e obrigatorio")
    @Positive(message = "Preco deve ser positivo")
    BigDecimal purchasePrice,

    @Positive(message = "Preco atual deve ser positivo")
    BigDecimal currentPrice,

    @NotNull(message = "Data de compra e obrigatoria")
    LocalDate purchaseDate
) {}
