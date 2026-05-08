package com.smartwallet.market.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "asset_categories")
data class AssetCategory(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 20)
    val code: String = "",

    @Column(nullable = false, length = 100)
    val name: String = "",

    @Column(length = 500)
    val description: String? = null,

    @Column(name = "icon_url", length = 500)
    val iconUrl: String? = null,

    @Column(name = "display_order")
    val displayOrder: Int? = null,

    @Column(name = "is_active")
    val isActive: Boolean = true,

    @Column(name = "created_at")
    val createdAt: Instant? = null,

    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
