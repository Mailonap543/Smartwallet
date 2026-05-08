package com.smartwallet.watchlist.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "watchlist_items")
data class WatchlistItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "watchlist_id", nullable = false)
    val watchlist: Watchlist,

    @Column(name = "asset_symbol", nullable = false, length = 20)
    val assetSymbol: String,

    @Column
    val position: Int? = 0,

    @Column(name = "created_at")
    val createdAt: Instant? = null
)
