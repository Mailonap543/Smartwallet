package com.smartwallet.portfolio.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "transactions")
data class Transaction(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    val asset: PortfolioAsset,

    @Column(name = "transaction_type", nullable = false, length = 20)
    val transactionType: String,

    @Column(nullable = false)
    val quantity: BigDecimal,

    @Column(nullable = false)
    val price: BigDecimal,

    @Column(name = "total_value", nullable = false)
    val totalValue: BigDecimal,

    val fees: BigDecimal? = BigDecimal.ZERO,

    @Column(name = "transaction_date", nullable = false)
    val transactionDate: Instant = Instant.now(),

    val notes: String? = null,

    @Column(name = "created_at")
    val createdAt: Instant? = null
