package com.smartwallet.dto.transaction;

import com.smartwallet.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateTransactionRequest(
    @NotNull(message = "Tipo de transação é obrigatório")
    Transaction.TransactionType transactionType,
    
    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "Quantidade deve ser positiva")
    BigDecimal quantity,
    
    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser positivo")
    BigDecimal price,
    
    BigDecimal fees,
    
    LocalDateTime transactionDate,
    
    String notes
) {}