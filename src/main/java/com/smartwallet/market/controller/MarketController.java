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

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/market")
public class MarketController {

    private static final Logger log = LoggerFactory.getLogger(MarketController.class);
    private static final SecureRandom RNG = new SecureRandom();

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

    @GetMapping("/assets/{symbol}/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "3M") String period) {
        
        return assetRepository.findBySymbol(symbol.toUpperCase())
            .map(asset -> {
                List<Map<String, Object>> history = generateHistory(asset, period);
                return ResponseEntity.ok(ApiResponse.success(history));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private List<Map<String, Object>> generateHistory(Asset asset, String period) {
        int days = switch (period) {
            case "1D" -> 1;
            case "1M" -> 30;
            case "3M" -> 90;
            case "6M" -> 180;
            case "1A" -> 365;
            default -> 90;
        };
        
        java.util.List<Map<String, Object>> history = new java.util.ArrayList<>();
        double price = asset.getCurrentPrice() != null ? asset.getCurrentPrice().doubleValue() : 100;
        
        for (int i = days; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            double variation = (RNG.nextDouble() - 0.5) * 0.04;
            price = price * (1 + variation);
            
            history.add(Map.of(
                "date", date.toString(),
                "open", price * 0.99,
                "high", price * 1.02,
                "low", price * 0.98,
                "close", price,
                "volume", RNG.nextLong(0, 10_000_000L)
            ));
        }
        
        return history;
    }

    @GetMapping("/assets/{symbol}/dividends")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDividends(@PathVariable String symbol) {
        return assetRepository.findBySymbol(symbol.toUpperCase())
            .map(asset -> {
                List<Map<String, Object>> dividends = generateDividends();
                return ResponseEntity.ok(ApiResponse.success(dividends));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private List<Map<String, Object>> generateDividends() {
        java.util.List<Map<String, Object>> dividends = new java.util.ArrayList<>();
        
        String[] dates = {"2026-03-15", "2025-12-15", "2025-09-15", "2025-06-15", "2025-03-15"};
        double[] amounts = {0.25, 0.23, 0.22, 0.21, 0.20};
        
        for (int i = 0; i < dates.length; i++) {
            dividends.add(Map.of(
                "symbol", "PETR4",
                "paymentDate", dates[i],
                "exDate", dates[i],
                "amount", amounts[i],
                "currency", "BRL"
            ));
        }
        
        return dividends;
    }

    @GetMapping("/assets/{symbol}/earnings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEarnings(@PathVariable String symbol) {
        return assetRepository.findBySymbol(symbol.toUpperCase())
            .map(asset -> {
                List<Map<String, Object>> earnings = generateEarnings();
                return ResponseEntity.ok(ApiResponse.success(earnings));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private List<Map<String, Object>> generateEarnings() {
        java.util.List<Map<String, Object>> earnings = new java.util.ArrayList<>();
        
        String[] dates = {"2025-12-31", "2025-09-30", "2025-06-30", "2025-03-31"};
        String[] periods = {"4T25", "3T25", "2T25", "1T25"};
        double[] revenues = {100.5, 95.2, 88.7, 82.3};
        double[] profits = {15.2, 12.8, 10.5, 8.9};
        
        for (int i = 0; i < dates.length; i++) {
            earnings.add(Map.of(
                "symbol", "PETR4",
                "date", dates[i],
                "period", periods[i],
                "revenue", revenues[i],
                "netIncome", profits[i],
                "eps", profits[i] / 10
            ));
        }
        
        return earnings;
    }

    @GetMapping("/rankings")
    public ResponseEntity<ApiResponse<Map<String, List<Asset>>>> getRankings(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        
        Map<String, List<Asset>> rankings = Map.of(
            "dividendYield", assetRepository.findTopByDividendYield(pageRequest).getContent(),
            "lowestPVPS", assetRepository.findLowestPriceToBook(pageRequest).getContent(),
            "highestROE", assetRepository.findHighestROE(pageRequest).getContent(),
            "highestRevenue", assetRepository.findHighestRevenue(pageRequest).getContent(),
            "highestNetIncome", assetRepository.findHighestNetIncome(pageRequest).getContent(),
            "highestLiquidity", assetRepository.findHighestVolume(pageRequest).getContent(),
            "topGainers", assetRepository.findTopGainers(pageRequest).getContent(),
            "topLosers", assetRepository.findTopLosers(pageRequest).getContent()
        );
        
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }

    @GetMapping("/rankings/{type}")
    public ResponseEntity<ApiResponse<List<Asset>>> getRankingByType(
            @PathVariable String type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Asset> ranking;
        
        ranking = switch (type.toLowerCase()) {
            case "dividendyield", "dividendos" -> assetRepository.findTopByDividendYield(pageRequest);
            case "pvps", "menor-pvp" -> assetRepository.findLowestPriceToBook(pageRequest);
            case "roe", "maior-roe" -> assetRepository.findHighestROE(pageRequest);
            case "receita", "maior-receita" -> assetRepository.findHighestRevenue(pageRequest);
            case "lucro", "maior-lucro" -> assetRepository.findHighestNetIncome(pageRequest);
            case "liquidez", "maior-liquidez" -> assetRepository.findHighestVolume(pageRequest);
            case "alta", "alta" -> assetRepository.findTopGainers(pageRequest);
            case "baixa", "baixa" -> assetRepository.findTopLosers(pageRequest);
            default -> assetRepository.findTopByDividendYield(pageRequest);
        };
        
        return ResponseEntity.ok(ApiResponse.success(ranking.getContent()));
    }
}
