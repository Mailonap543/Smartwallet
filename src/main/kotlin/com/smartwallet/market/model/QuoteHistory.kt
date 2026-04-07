package com.smartwallet.market.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.Instant

@Entity
@Table(name = "quote_history")
data class QuoteHistory(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    val asset: MarketAsset,

    @Column(name = "quote_date", nullable = false)
    val quoteDate: LocalDate,

    @Column(name = "open_price")
    val openPrice: BigDecimal? = null,
    @Column(name = "high_price")
    val highPrice: BigDecimal? = null,
    @Column(name = "low_price")
    val lowPrice: BigDecimal? = null,
    @Column(name = "close_price", nullable = false)
    val closePrice: BigDecimal,
    val volume: Long? = null,
    @Column(name = "adjusted_close")
    val adjustedClose: BigDecimal? = null,
    @Column(name = "created_at")
    val createdAt: Instant? = null
)
