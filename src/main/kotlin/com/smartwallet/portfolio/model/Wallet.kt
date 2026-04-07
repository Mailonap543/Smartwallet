package com.smartwallet.portfolio.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "wallets")
data class Wallet(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val name: String,

    val description: String? = null,

    @Column(name = "total_balance")
    val totalBalance: BigDecimal? = BigDecimal.ZERO,

    @Column(name = "created_at")
    val createdAt: Instant? = null,

    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
