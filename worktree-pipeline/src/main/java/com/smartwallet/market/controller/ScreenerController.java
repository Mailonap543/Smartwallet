package com.smartwallet.market.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.market.entity.Asset;
import com.smartwallet.market.repository.AssetRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/market/screener")
public class ScreenerController {

    private static final String MAX_PE_KEY = "maxPe";
    private static final String MAX_PB_KEY = "maxPb";

    private final AssetRepository assetRepository;

    public ScreenerController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<Asset>>> search(@RequestBody Map<String, Object> filters) {
        Pageable pageable = PageRequest.of(0, 100, Sort.by("symbol").ascending());
        
        List<Asset> assets = assetRepository.findAll(pageable).getContent();
        
        if (filters.containsKey("category")) {
            String category = (String) filters.get("category");
            if (category != null && !category.isBlank()) {
                assets = assets.stream()
                    .filter(a -> category.equalsIgnoreCase(a.getCategory() != null ? a.getCategory().getCode() : ""))
                    .toList();
            }
        }
        
        if (filters.containsKey(MAX_PE_KEY)) {
            BigDecimal maxPe = new BigDecimal(filters.get("maxPe").toString());
            assets = assets.stream()
                .filter(a -> a.getPriceToEarnings() == null || a.getPriceToEarnings().compareTo(maxPe) <= 0)
                .toList();
        }
        
        if (filters.containsKey(MAX_PB_KEY)) {
            BigDecimal maxPb = new BigDecimal(filters.get("maxPb").toString());
            assets = assets.stream()
                .filter(a -> a.getPriceToBook() == null || a.getPriceToBook().compareTo(maxPb) <= 0)
                .toList();
        }
        
        if (filters.containsKey("minDy")) {
            BigDecimal minDy = new BigDecimal(filters.get("minDy").toString());
            assets = assets.stream()
                .filter(a -> a.getDividendYield() != null && a.getDividendYield().compareTo(minDy) >= 0)
                .toList();
        }
        
        if (filters.containsKey("minRoe")) {
            BigDecimal minRoe = new BigDecimal(filters.get("minRoe").toString());
            assets = assets.stream()
                .filter(a -> a.getRoe() != null && a.getRoe().compareTo(minRoe) >= 0)
                .toList();
        }
        
        if (filters.containsKey("sector")) {
            String sector = (String) filters.get("sector");
            if (sector != null && !sector.isBlank()) {
                assets = assets.stream()
                    .filter(a -> sector.equalsIgnoreCase(a.getSegment()))
                    .toList();
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(assets));
    }

    @GetMapping("/presets")
    public ResponseEntity<ApiResponse<Map<String, Map<String, Object>>>> getPresets() {
        Map<String, Map<String, Object>> presets = Map.of(
            "dividends", Map.of(
                "name", "Dividendos",
                "description", "Ações com bom dividend yield",
                "minDy", 5,
                "maxPe", 20
            ),
            "value", Map.of(
                "name", "Valor",
                "description", "Ações subavaliadas",
                "maxPb", 1.5,
                "maxPe", 15
            ),
            "quality", Map.of(
                "name", "Qualidade",
                "description", "Empresas com alto ROE",
                "minRoe", 15,
                "maxPe", 25
            ),
            "growth", Map.of(
                "name", "Crescimento",
                "description", "Empresas em crescimento",
                "minRoe", 20,
                "maxPe", 30
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success(presets));
    }
}