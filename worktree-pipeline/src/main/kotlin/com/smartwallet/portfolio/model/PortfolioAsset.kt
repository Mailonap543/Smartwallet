package com.smartwallet.portfolio.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = "portfolio_assets")
data class PortfolioAsset(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    val wallet: Wallet,

    @Column(nullable = false, length = 20)
    val symbol: String,

    @Column(nullable = false)
    val name: String,

    @Column(name = "asset_type", nullable = false)
    val assetType: String,

    @Column(nullable = false)
    val quantity: BigDecimal,

    @Column(name = "purchase_price", nullable = false)
    val purchasePrice: BigDecimal,

    @Column(name = "current_price")
    val currentPrice: BigDecimal? = null,

    @Column(name = "purchase_date", nullable = false)
    val purchaseDate: LocalDate,

    @Column(name = "created_at")
    val createdAt: Instant? = null,

    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
