package com.smartwallet.ai.chat

import com.smartwallet.ai.AIService
import org.springframework.stereotype.Service

@Service
class JarvisChatService(
    private val pythonAiClient: PythonAiClient
) {
    fun chat(
        request: JarvisChatRequest,
        analysis: AIService.AnalysisResult
    ): JarvisChatResponse {
        val context = JarvisChatContext(
            riskMetrics = analysis.riskMetrics,
            scoreMetrics = analysis.score,
            recommendations = analysis.recommendations
        )

        return pythonAiClient.generateChatResponse(request, context)
    }
}

