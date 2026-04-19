package com.smartwallet.dto.transaction;

import com.smartwallet.entity.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
    Long id,
    String transactionType,
    BigDecimal quantity,
    BigDecimal price,
    BigDecimal totalValue,
    BigDecimal fees,
    BigDecimal totalWithFees,
    LocalDateTime transactionDate,
    String notes,
    LocalDateTime createdAt
) {
    public static TransactionResponse fromEntity(Transaction transaction) {
        return new TransactionResponse(
            transaction.getId(),
            transaction.getTransactionType() != null ? transaction.getTransactionType().name() : null,
            transaction.getQuantity(),
            transaction.getPrice(),
            transaction.getTotalValue(),
            transaction.getFees() != null ? transaction.getFees() : BigDecimal.ZERO,
            transaction.getTotalWithFees() != null ? transaction.getTotalWithFees() : BigDecimal.ZERO,
            transaction.getTransactionDate(),
            transaction.getNotes(),
            transaction.getCreatedAt()
        );
    }
}