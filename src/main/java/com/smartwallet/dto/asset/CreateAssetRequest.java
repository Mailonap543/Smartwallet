package com.smartwallet.dto.asset;

import com.smartwallet.entity.Asset;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateAssetRequest(
    @NotBlank(message = "Símbolo é obrigatório")
    String symbol,
    
    @NotBlank(message = "Nome é obrigatório")
    String name,
    
    @NotNull(message = "Tipo de ativo é obrigatório")
    Asset.AssetType assetType,
    
    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "Quantidade deve ser positiva")
    BigDecimal quantity,
    
    @NotNull(message = "Preço de compra é obrigatório")
    @Positive(message = "Preço deve ser positivo")
    BigDecimal purchasePrice,
    
    BigDecimal currentPrice,
    
    @NotNull(message = "Data de compra é obrigatória")
    LocalDate purchaseDate
) {}