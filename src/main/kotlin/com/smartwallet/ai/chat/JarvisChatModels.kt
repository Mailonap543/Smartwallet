package com.smartwallet.ai.chat

import com.smartwallet.ai.model.Recommendation
import com.smartwallet.ai.model.RiskMetrics
import com.smartwallet.ai.model.ScoreMetrics
import com.smartwallet.dto.ai.GoogleSearchResult

data class JarvisChatRequest(
    val message: String,
    val sessionId: String? = null,
    val webSearch: Boolean = false
)

data class JarvisChatResponse(
    val reply: String,
    val sessionId: String,
    val googleUrl: String? = null,
    val searchResults: List<GoogleSearchResult> = emptyList(),
    val intent: String? = null,
    val confidence: Double? = null,
    val actions: List<String> = emptyList(),
    val capabilities: List<String> = emptyList()
)

/**
 * Contexto (sem dados sensíveis) para o "Jarvis".
 * No futuro, isso vira o payload enviado ao microserviço Python.
 */
data class JarvisChatContext(
    val riskMetrics: RiskMetrics,
    val scoreMetrics: ScoreMetrics,
    val recommendations: List<Recommendation>
)

data class PythonJarvisChatRequest(
    val message: String,
    val sessionId: String? = null,
    val context: JarvisChatContext,
    val webSearch: Boolean = false
)

data class PythonJarvisChatResponse(
    val reply: String,
    val sessionId: String,
    val googleUrl: String? = null,
    val searchResults: List<GoogleSearchResult> = emptyList(),
    val intent: String? = null,
    val confidence: Double? = null,
    val actions: List<String> = emptyList(),
    val capabilities: List<String> = emptyList()
)

