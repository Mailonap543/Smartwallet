package com.smartwallet.ai.chat

import com.smartwallet.ai.AIService
import com.smartwallet.dto.ai.GoogleSearchResponse
import com.smartwallet.service.GoogleSearchService
import org.springframework.stereotype.Service

@Service
class JarvisChatService(
    private val pythonAiClient: PythonAiClient,
    private val googleSearchService: GoogleSearchService
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

        val response = pythonAiClient.generateChatResponse(request, context)
        return enrichWithWebSearch(request, response)
    }

    private fun enrichWithWebSearch(
        request: JarvisChatRequest,
        response: JarvisChatResponse
    ): JarvisChatResponse {
        if (!request.webSearch || !shouldRunWebSearch(request.message)) {
            return response
        }

        return try {
            val search = googleSearchService.searchStocks(request.message)
            response.copy(
                reply = appendSearchNotice(response.reply, search),
                googleUrl = search.googleUrl(),
                searchResults = search.results().orEmpty()
            )
        } catch (_: RuntimeException) {
            response
        }
    }

    private fun shouldRunWebSearch(message: String): Boolean {
        val normalized = message.lowercase()
        val hasTicker = Regex("\\b[A-Z]{4}\\d{1,2}\\b", RegexOption.IGNORE_CASE).containsMatchIn(message)
        val searchTerms = listOf(
            "google",
            "pesquisa",
            "pesquisar",
            "noticia",
            "noticias",
            "cotacao",
            "atual",
            "hoje",
            "agora",
            "mercado",
            "acao",
            "acoes",
            "fii",
            "dividendo",
            "dividendos",
            "selic",
            "ipca",
            "dolar",
            "fundamentos"
        )

        return hasTicker || searchTerms.any { term -> normalized.contains(term) }
    }

    private fun appendSearchNotice(reply: String, search: GoogleSearchResponse): String {
        val notice = if (search.results().isNullOrEmpty()) {
            "Pesquisa web preparada: deixei um link do Google para validar informacoes atuais."
        } else {
            "Fontes atuais anexadas abaixo para voce conferir os dados de mercado."
        }

        return "${reply.trim()}\n\n$notice"
    }
}

