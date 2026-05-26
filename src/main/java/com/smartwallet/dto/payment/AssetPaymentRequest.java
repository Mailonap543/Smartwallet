package com.smartwallet.dto.payment;

import com.smartwallet.entity.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetPaymentRequest(
        @NotBlank(message = "Banco é obrigatório")
        String institutionId,

        @NotBlank(message = "Símbolo é obrigatório")
        String symbol,

        @NotBlank(message = "Nome do ativo é obrigatório")
        String name,

        AssetType assetType,

        @NotNull(message = "Quantidade é obrigatória")
        @Positive(message = "Quantidade deve ser positiva")
        BigDecimal quantity,

        @NotNull(message = "Preço é obrigatório")
        @Positive(message = "Preço deve ser positivo")
        BigDecimal price,

        BigDecimal fees,

        LocalDate transactionDate,

        String notes
) {}
