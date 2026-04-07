package com.smartwallet.news.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.news.entity.NewsItem;
import com.smartwallet.news.repository.NewsRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    private final NewsRepository newsRepository;

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsItem>>> getNews(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String symbol,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        var pageRequest = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        
        List<NewsItem> news;
        if (symbol != null && !symbol.isBlank()) {
            news = newsRepository.findByRelatedSymbolsContainingIgnoreCase(symbol.toUpperCase(), pageRequest).getContent();
        } else if (category != null && !category.isBlank()) {
            news = newsRepository.findByCategory(category, pageRequest).getContent();
        } else {
            news = newsRepository.findAll(pageRequest).getContent();
        }
        
        return ResponseEntity.ok(ApiResponse.success(news));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<NewsItem>>> getFeatured() {
        List<NewsItem> featured = newsRepository.findByIsFeaturedTrue();
        return ResponseEntity.ok(ApiResponse.success(featured));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsItem>> getNewsById(@PathVariable Long id) {
        return newsRepository.findById(id)
            .map(news -> ResponseEntity.ok(ApiResponse.success(news)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<NewsItem>>> getLatest(
            @RequestParam(defaultValue = "10") int limit) {
        var pageRequest = PageRequest.of(0, limit, Sort.by("publishedAt").descending());
        List<NewsItem> latest = newsRepository.findAll(pageRequest).getContent();
        return ResponseEntity.ok(ApiResponse.success(latest));
    }
}