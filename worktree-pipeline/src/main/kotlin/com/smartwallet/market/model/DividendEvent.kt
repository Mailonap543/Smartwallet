package com.smartwallet.market.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.Instant

@Entity
@Table(name = "dividend_events")
data class DividendEvent(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    val asset: MarketAsset,

    @Column(name = "event_date", nullable = false)
    val eventDate: LocalDate,
    @Column(name = "payment_date")
    val paymentDate: LocalDate? = null,
    @Column(name = "dividend_type")
    val dividendType: String? = null,
    @Column(name = "dividend_amount", nullable = false)
    val dividendAmount: BigDecimal,
    @Column(length = 3)
    val currency: String? = "BRL",
    @Column(name = "is_exclusive")
    val isExclusive: Boolean = false,
    val notes: String? = null,
    @Column(name = "created_at")
    val createdAt: Instant? = null
)
