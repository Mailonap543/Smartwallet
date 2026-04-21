package com.smartwallet.watchlist.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "alerts")
data class Alert(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "asset_symbol", nullable = false, length = 20)
    val assetSymbol: String,

    @Column(name = "alert_type", nullable = false, length = 50)
    val alertType: String,

    @Column(name = "target_value")
    val targetValue: BigDecimal? = null,

    @Column(name = "is_active")
    val isActive: Boolean = true,

    @Column(name = "created_at")
    val createdAt: Instant? = null
)
