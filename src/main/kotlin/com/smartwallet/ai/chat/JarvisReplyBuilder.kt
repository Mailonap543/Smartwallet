package com.smartwallet.ai.chat

import com.smartwallet.ai.model.RecommendationType
import java.util.UUID

object JarvisReplyBuilder {
    fun buildLocal(request: JarvisChatRequest, context: JarvisChatContext): JarvisChatResponse {
        val sessionId = request.sessionId ?: UUID.randomUUID().toString()

        val riskLevel = context.riskMetrics.riskLevel.name
        val overallScore = context.scoreMetrics.overallScore
        val topRecs = context.recommendations.take(3)
        val topImprovementLines = context.scoreMetrics.recommendations.take(3)

        val riskRec =
            topRecs.firstOrNull { rec ->
                when (rec.type) {
                    RecommendationType.REDUCE_RISK -> true
                    RecommendationType.DIVERSIFY -> request.message.contains("risco", ignoreCase = true)
                    else -> false
                }
            } ?: topRecs.firstOrNull()

        val actionHint = riskRec?.actionRequired ?: "Monitore sua carteira e reavalie periodicamente."
        val normalizedMsg = request.message.trim()

        val reply = buildString {
            append("Analisando sua carteira, aqui vai um resumo rápido:\n")
            append("- Score geral: $overallScore/100\n")
            append("- Nível de risco: $riskLevel\n\n")

            if (topRecs.isNotEmpty()) {
                append("Recomendações principais:\n")
                topRecs.forEachIndexed { idx, rec ->
                    append("${idx + 1}. ${rec.title} — ${rec.actionRequired}\n")
                }
                append("\n")
            }

            if (topImprovementLines.isNotEmpty()) {
                append("Melhorias sugeridas (gerais):\n")
                topImprovementLines.forEach { line ->
                    append("- $line\n")
                }
                append("\n")
            }

            append("Pergunta do usuário: \"$normalizedMsg\"\n\n")
            append("Sugestão prática com base no seu perfil atual: $actionHint\n\n")
            append("Observação: isso é uma orientação educacional e não constitui recomendação financeira.")
        }

        return JarvisChatResponse(reply = reply, sessionId = sessionId)
    }
}

