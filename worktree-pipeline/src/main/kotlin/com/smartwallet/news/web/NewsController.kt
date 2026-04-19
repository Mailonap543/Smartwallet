package com.smartwallet.news.web

import com.smartwallet.common.ApiResponse
import com.smartwallet.news.model.NewsItem
import com.smartwallet.news.service.NewsService
import org.springframework.data.domain.Page
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/news", "/api/v1/news"])
class NewsController(
    private val newsService: NewsService
) {

    @GetMapping
    fun latest(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<Page<NewsItem>> = ApiResponse(data = newsService.latest(page, size))

    @GetMapping("/symbol/{symbol}")
    fun bySymbol(
        @PathVariable symbol: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<Page<NewsItem>> = ApiResponse(data = newsService.bySymbol(symbol, page, size))
}
