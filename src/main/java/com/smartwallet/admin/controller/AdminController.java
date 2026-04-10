package com.smartwallet.admin.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.market.entity.Asset;
import com.smartwallet.market.entity.AssetCategory;
import com.smartwallet.market.repository.AssetCategoryRepository;
import com.smartwallet.market.repository.AssetRepository;
import com.smartwallet.news.entity.NewsItem;
import com.smartwallet.news.repository.NewsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;
    private final NewsRepository newsRepository;

    public AdminController(AssetRepository assetRepository, AssetCategoryRepository categoryRepository, NewsRepository newsRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.newsRepository = newsRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        long assets = assetRepository.count();
        long categories = categoryRepository.count();
        long news = newsRepository.count();
        
        Map<String, Long> stats = Map.of(
            "assets", assets,
            "categories", categories,
            "news", news
        );
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(assets));
    }

    @PutMapping("/assets/{id}")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return assetRepository.findById(id)
            .map(asset -> {
                if (data.containsKey("isTracked")) {
                    asset.setIsTracked((Boolean) data.get("isTracked"));
                }
                if (data.containsKey("isFeatured")) {
                    asset.setIsFeatured((Boolean) data.get("isFeatured"));
                }
                if (data.containsKey("isActive")) {
                    asset.setIsActive((Boolean) data.get("isActive"));
                }
                asset = assetRepository.save(asset);
                return ResponseEntity.ok(ApiResponse.success("Ativo atualizado", asset));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<AssetCategory>>> getCategories() {
        List<AssetCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<AssetCategory>> createCategory(@RequestBody Map<String, Object> data) {
        AssetCategory category = new AssetCategory();
        category.setCode((String) data.get("code"));
        category.setName((String) data.get("name"));
        category.setDescription((String) data.get("description"));
        category.setDisplayOrder(data.get("displayOrder") != null ? (Integer) data.get("displayOrder") : 0);
        
        category = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Categoria criada", category));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<List<NewsItem>>> getAllNews() {
        List<NewsItem> news = newsRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(news));
    }

    @PostMapping("/news")
    public ResponseEntity<ApiResponse<NewsItem>> createNews(@RequestBody Map<String, Object> data) {
        NewsItem news = new NewsItem();
        news.setTitle((String) data.get("title"));
        news.setSummary((String) data.get("summary"));
        news.setContent((String) data.get("content"));
        news.setSource((String) data.get("source"));
        news.setSourceUrl((String) data.get("sourceUrl"));
        news.setCategory((String) data.get("category"));
        news.setRelatedSymbols((String) data.get("relatedSymbols"));
        
        news = newsRepository.save(news);
        return ResponseEntity.ok(ApiResponse.success("Notícia criada", news));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<ApiResponse<NewsItem>> updateNews(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return newsRepository.findById(id)
            .map(news -> {
                if (data.containsKey("title")) news.setTitle((String) data.get("title"));
                if (data.containsKey("summary")) news.setSummary((String) data.get("summary"));
                if (data.containsKey("content")) news.setContent((String) data.get("content"));
                if (data.containsKey("isFeatured")) news.setFeatured((Boolean) data.get("isFeatured"));
                
                news = newsRepository.save(news);
                return ResponseEntity.ok(ApiResponse.success("Notícia atualizada", news));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}