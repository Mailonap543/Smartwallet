package com.smartwallet.news.repository;

import com.smartwallet.news.entity.NewsItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<NewsItem, Long> {
    Page<NewsItem> findByCategory(String category, Pageable pageable);
    Page<NewsItem> findByRelatedSymbolsContainingIgnoreCase(String symbol, Pageable pageable);
    List<NewsItem> findByIsFeaturedTrue();
}