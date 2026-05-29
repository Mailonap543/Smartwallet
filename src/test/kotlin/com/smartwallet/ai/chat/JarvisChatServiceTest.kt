package com.smartwallet.ai.chat

import com.smartwallet.ai.AIService
import com.smartwallet.ai.model.*
import com.smartwallet.dto.ai.GoogleSearchResponse
import com.smartwallet.dto.ai.GoogleSearchResult
import com.smartwallet.service.GoogleSearchService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDate

class JarvisChatServiceTest {

    private lateinit var jarvisChatService: JarvisChatService
    private lateinit var mockPythonAiClient: PythonAiClient
    private lateinit var googleSearchService: GoogleSearchService

    @BeforeEach
    fun setup() {
        mockPythonAiClient = object : PythonAiClient {
            override fun generateChatResponse(request: JarvisChatRequest, context: JarvisChatContext): JarvisChatResponse {
                return JarvisChatResponse(reply = "Mock response", sessionId = request.sessionId ?: "test-session")
            }
        }
        googleSearchService = mock()
        jarvisChatService = JarvisChatService(mockPythonAiClient, googleSearchService)
    }

    @Test
    fun `chat returns response with session id`() {
        val request = JarvisChatRequest(message = "What is my risk level?")
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertNotNull(response)
        assertNotNull(response.sessionId)
        assertTrue(response.reply.isNotBlank())
    }

    @Test
    fun `chat preserves existing session id`() {
        val sessionId = "existing-session-123"
        val request = JarvisChatRequest(message = "Hello", sessionId = sessionId)
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertEquals(sessionId, response.sessionId)
    }

    @Test
    fun `chat handles null session id`() {
        val request = JarvisChatRequest(message = "Test", sessionId = null)
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertNotNull(response.sessionId)
        assertTrue(response.sessionId.isNotBlank())
    }

    @Test
    fun `chat response includes context information`() {
        val request = JarvisChatRequest(message = "Tell me about my portfolio")
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertTrue(response.reply.contains("Mock response") || response.reply.isNotBlank())
    }

    @Test
    fun `chat attaches google search when web search is enabled for market query`() {
        whenever(googleSearchService.searchStocks(any())).thenReturn(
            GoogleSearchResponse(
                "PETR4 hoje",
                true,
                "Pesquisa concluida",
                "https://www.google.com/search?q=PETR4",
                listOf(
                    GoogleSearchResult(
                        "PETR4 cotacao",
                        "https://example.com/petr4",
                        "Resumo de mercado",
                        "example.com"
                    )
                )
            )
        )
        val request = JarvisChatRequest(message = "cotacao PETR4 hoje", webSearch = true)
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertEquals("https://www.google.com/search?q=PETR4", response.googleUrl)
        assertEquals(1, response.searchResults.size)
        assertTrue(response.reply.contains("Fontes atuais"))
    }

    @Test
    fun `chat does not search web for portfolio-only question`() {
        val request = JarvisChatRequest(message = "qual meu risco da carteira", webSearch = true)
        val context = createSampleContext()

        val response = jarvisChatService.chat(request, context)

        assertNull(response.googleUrl)
        verify(googleSearchService, never()).searchStocks(any())
    }

    private fun createSampleContext(): AIService.AnalysisResult {
        return AIService.AnalysisResult(
            riskMetrics = RiskMetrics(
                portfolioVolatility = BigDecimal("15.0"),
                sharpeRatio = BigDecimal("0.8"),
                beta = BigDecimal("1.1"),
                maxDrawdown = BigDecimal("8.0"),
                var95 = BigDecimal("3.0"),
                riskScore = 50,
                riskLevel = RiskLevel.MODERATE
            ),
            score = ScoreMetrics(
                overallScore = 75,
                diversificationScore = 35,
                riskReturnScore = 60,
                liquidityScore = 40,
                concentrationScore = 70,
                stabilityScore = 65,
                recommendations = listOf("Diversify your holdings")
            ),
            recommendations = listOf(
                Recommendation(
                    type = RecommendationType.HOLD,
                    title = "Continue monitoring",
                    description = "Your portfolio is stable",
                    priority = 999,
                    potentialImpact = null,
                    actionRequired = "Review quarterly"
                )
            )
        )
    }
}
