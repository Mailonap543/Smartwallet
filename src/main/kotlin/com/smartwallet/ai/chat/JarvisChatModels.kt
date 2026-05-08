package com.smartwallet.ai.chat

import com.smartwallet.ai.model.Recommendation
import com.smartwallet.ai.model.RiskMetrics
import com.smartwallet.ai.model.ScoreMetrics

data class JarvisChatRequest(
    val message: String,
    val sessionId: String? = null
)

data class JarvisChatResponse(
    val reply: String,
    val sessionId: String
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
    val context: JarvisChatContext
)

data class PythonJarvisChatResponse(
    val reply: String,
    val sessionId: String
)

