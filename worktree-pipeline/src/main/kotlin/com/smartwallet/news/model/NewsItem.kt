package com.smartwallet.news.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "news_items")
data class NewsItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    val title: String,
    @Column(columnDefinition = "TEXT")
    val summary: String? = null,
    @Column(nullable = false)
    val source: String,
    @Column(name = "published_at", nullable = false)
    val publishedAt: Instant,
    val url: String? = null,
    @Column(name = "symbols")
    val symbols: String? = null, // comma-separated
    @Column(name = "created_at")
    val createdAt: Instant? = null
)
