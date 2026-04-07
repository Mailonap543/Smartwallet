package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.common.ApiResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/ai", "/api/v1/ai"])
class AiController(
    private val aiService: AIService
) {

    @GetMapping("/analyze")
    fun analyze(@RequestParam userId: Long): ApiResponse<Map<String, Any>> =
        ApiResponse(data = aiService.analyzePortfolio(userId))

    @GetMapping("/recommendations")
    fun recommendations(): ApiResponse<List<Map<String, Any>>> =
        ApiResponse(data = aiService.getRecommendations())
}
