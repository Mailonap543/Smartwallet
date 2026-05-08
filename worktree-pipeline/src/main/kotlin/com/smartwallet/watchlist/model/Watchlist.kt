package com.smartwallet.watchlist.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "watchlists")
data class Watchlist(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val name: String,

    @Column(name = "is_default")
    val isDefault: Boolean = false,

    @Column(name = "created_at")
    val createdAt: Instant? = null,

    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
