package com.smartwallet.market.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.PageResponse;
import com.smartwallet.market.entity.Asset;
import com.smartwallet.market.entity.AssetCategory;
import com.smartwallet.market.repository.AssetCategoryRepository;
import com.smartwallet.market.repository.AssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/market")
public class MarketController {

    private static final Logger log = LoggerFactory.getLogger(MarketController.class);

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository categoryRepository;

    public MarketController(AssetRepository assetRepository, AssetCategoryRepository categoryRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<Asset>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "symbol") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<Asset> results;
        if (q != null && !q.isBlank()) {
            results = assetRepository.search(q, pageRequest);
        } else if (category != null && !category.isBlank()) {
        } else {
            results = assetRepository.findAll(pageRequest);
        }
        
        PageResponse<Asset> response = new PageResponse<>(
            results.getContent(),
            results.getNumber(),
            results.getSize(),
            results.getTotalElements(),
            results.getTotalPages(),
            results.isFirst(),
        );
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<PageResponse<Asset>>> getAssets(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("symbol").ascending());
        Page<Asset> results;
        
        if (category != null && !category.isBlank()) {
        } else {
            results = assetRepository.findAll(pageRequest);
        }
        
        PageResponse<Asset> response = new PageResponse<>(
            results.getContent(),
            results.getNumber(),
            results.getSize(),
            results.getTotalElements(),
            results.getTotalPages(),
            results.isFirst(),
        );
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/assets/{symbol}")
    public ResponseEntity<ApiResponse<Asset>> getAsset(@PathVariable String symbol) {
        return assetRepository.findBySymbol(symbol.toUpperCase())
            .map(asset -> ResponseEntity.ok(ApiResponse.success(asset)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assets/{symbol}/quote")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQuote(@PathVariable String symbol) {
        return assetRepository.findBySymbol(symbol.toUpperCase())
            .map(asset -> {
                Map<String, Object> quote = Map.of(
                    "symbol", asset.getSymbol(),
                    "name", asset.getName(),
                    "changePercent", asset.getChangePercent() != null ? asset.getChangePercent() : 0,
                    "dayHigh", asset.getDayHigh() != null ? asset.getDayHigh() : 0,
                    "dayLow", asset.getDayLow() != null ? asset.getDayLow() : 0,
                    "volume", asset.getDayVolume() != null ? asset.getDayVolume() : 0,
                    "marketCap", asset.getMarketCap() != null ? asset.getMarketCap() : 0,
                    "updatedAt", asset.getLastQuoteAt() != null ? asset.getLastQuoteAt().toString() : ""
                );
                return ResponseEntity.ok(ApiResponse.success(quote));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<Asset>>> getFeatured() {
        List<Asset> featured = assetRepository.findFeatured();
        return ResponseEntity.ok(ApiResponse.success(featured));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<Asset>>> getTrending() {
        List<Asset> trending = assetRepository.findAllTracked().stream().limit(10).toList();
        return ResponseEntity.ok(ApiResponse.success(trending));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<AssetCategory>>> getCategories() {
        List<AssetCategory> categories = categoryRepository.findAllByOrderByDisplayOrder();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/categories/{code}")
    public ResponseEntity<ApiResponse<AssetCategory>> getCategory(@PathVariable String code) {
        return categoryRepository.findByCode(code)
            .map(cat -> ResponseEntity.ok(ApiResponse.success(cat)))
            .orElse(ResponseEntity.notFound().build());
    }
}