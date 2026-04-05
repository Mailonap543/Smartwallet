package com.smartwallet.dto.asset;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdatePriceRequest(
    @NotNull(message = "Preço atual é obrigatório")
    @Positive(message = "Preço deve ser positivo")
    BigDecimal currentPrice
) {}