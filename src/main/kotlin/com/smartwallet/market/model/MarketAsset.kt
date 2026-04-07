package com.smartwallet.market.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "assets")
data class MarketAsset(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 20)
    val symbol: String = "",

    @Column(nullable = false, length = 200)
    val name: String = "",

    @Column(length = 20)
    val isin: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    val category: AssetCategory? = null,

    val segment: String? = null,
    @Column(name = "sub_segment")
    val subSegment: String? = null,
    @Column(name = "company_name")
    val companyName: String? = null,
    @Column(name = "logo_url")
    val logoUrl: String? = null,
    val website: String? = null,
    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Column(name = "current_price")
    val currentPrice: BigDecimal? = null,
    @Column(name = "previous_close")
    val previousClose: BigDecimal? = null,
    @Column(name = "change_percent")
    val changePercent: BigDecimal? = null,
    @Column(name = "day_high")
    val dayHigh: BigDecimal? = null,
    @Column(name = "day_low")
    val dayLow: BigDecimal? = null,
    @Column(name = "day_volume")
    val dayVolume: Long? = null,
    @Column(name = "market_cap")
    val marketCap: BigDecimal? = null,
    @Column(name = "price_to_earnings")
    val priceToEarnings: BigDecimal? = null,
    @Column(name = "price_to_book")
    val priceToBook: BigDecimal? = null,
    @Column(name = "dividend_yield")
    val dividendYield: BigDecimal? = null,
    @Column(name = "roe")
    val roe: BigDecimal? = null,
    val revenue: BigDecimal? = null,
    @Column(name = "net_income")
    val netIncome: BigDecimal? = null,
    @Column(name = "total_debt")
    val totalDebt: BigDecimal? = null,
    val cash: BigDecimal? = null,
    @Column(name = "high_52w")
    val high52w: BigDecimal? = null,
    @Column(name = "low_52w")
    val low52w: BigDecimal? = null,

    @Column(name = "is_tracked")
    val isTracked: Boolean = true,
    @Column(name = "is_featured")
    val isFeatured: Boolean = false,
    @Column(name = "last_quote_at")
    val lastQuoteAt: Instant? = null,
    @Column(name = "data_source")
    val dataSource: String? = null,
    @Column(name = "is_active")
    val isActive: Boolean = true,
    @Column(name = "created_at")
    val createdAt: Instant? = null,
    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
