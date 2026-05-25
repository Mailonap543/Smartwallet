package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.ai.GoogleSearchResponse;
import com.smartwallet.service.GoogleSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiSearchController {

    private final GoogleSearchService googleSearchService;

    public AiSearchController(GoogleSearchService googleSearchService) {
        this.googleSearchService = googleSearchService;
    }

    @GetMapping("/google-search")
    public ResponseEntity<ApiResponse<GoogleSearchResponse>> googleSearch(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(googleSearchService.searchStocks(query)));
    }
}
