package com.smartwallet.news.service

import com.smartwallet.news.model.NewsItem
import com.smartwallet.news.repository.NewsRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class NewsService(
    private val newsRepo: NewsRepository
) {
    @Transactional(readOnly = true)
    fun latest(page: Int, size: Int): Page<NewsItem> =
        newsRepo.findAll(PageRequest.of(page, size))

    @Transactional(readOnly = true)
    fun bySymbol(symbol: String, page: Int, size: Int): Page<NewsItem> =
        newsRepo.findBySymbolsContainingIgnoreCase(symbol, PageRequest.of(page, size))

    @Transactional
    fun create(title: String, summary: String?, source: String, url: String?, symbols: List<String>): NewsItem =
        newsRepo.save(
            NewsItem(
                title = title,
                summary = summary,
                source = source,
                url = url,
                symbols = symbols.joinToString(","),
                publishedAt = Instant.now()
            )
        )
}
