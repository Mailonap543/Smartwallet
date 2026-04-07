package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.common.ApiResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/ai", "/api/v1/ai"])
class AiController(
) {

    @GetMapping("/analyze")

    @GetMapping("/recommendations")
}
