package com.smartwallet.news.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "LegacyNewsItem")
@Table(name = "news_items")
public class NewsItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "source_url")
    private String sourceUrl;
    
    @Column
    private String source;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "related_symbols", columnDefinition = "TEXT")
    private String relatedSymbols;
    
    @Column
    private String category;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "is_featured")
    private boolean isFeatured;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (publishedAt == null) publishedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getRelatedSymbols() { return relatedSymbols; }
    public void setRelatedSymbols(String relatedSymbols) { this.relatedSymbols = relatedSymbols; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
