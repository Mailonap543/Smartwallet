package com.smartwallet.market.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.Instant

@Entity
@Table(name = "earnings_events")
data class EarningsEvent(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    val asset: MarketAsset,

    @Column(nullable = false)
    val period: String,

    @Column(name = "event_date", nullable = false)
    val eventDate: LocalDate,

    val revenue: BigDecimal? = null,
    @Column(name = "net_income")
    val netIncome: BigDecimal? = null,
    @Column(name = "earnings_per_share")
    val earningsPerShare: BigDecimal? = null,
    @Column(name = "expected_eps")
    val expectedEps: BigDecimal? = null,
    @Column(length = 3)
    val currency: String? = "BRL",
    val notes: String? = null,
    @Column(name = "created_at")
    val createdAt: Instant? = null
)
