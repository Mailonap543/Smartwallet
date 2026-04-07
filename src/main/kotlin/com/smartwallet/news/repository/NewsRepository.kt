package com.smartwallet.news.repository

import com.smartwallet.news.model.NewsItem
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NewsRepository : JpaRepository<NewsItem, Long> {
    fun findBySymbolsContainingIgnoreCase(symbol: String, pageable: Pageable): Page<NewsItem>
}
