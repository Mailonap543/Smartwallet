package com.smartwallet.ai.chat

import com.smartwallet.ai.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class JarvisReplyBuilderTest {

    @Test
    fun `buildLocal returns response with session id`() {
        val request = JarvisChatRequest(message = "Hello", sessionId = "test-session")
        val context = createSampleContext()

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertEquals("test-session", response.sessionId)
        assertTrue(response.reply.isNotBlank())
    }

    @Test
    fun `buildLocal generates new session id when not provided`() {
        val request = JarvisChatRequest(message = "Hello", sessionId = null)
        val context = createSampleContext()

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertNotNull(response.sessionId)
        assertTrue(response.sessionId.isNotEmpty())
    }

    @Test
    fun `buildLocal includes portfolio score`() {
        val request = JarvisChatRequest(message = "What is my score?")
        val context = createSampleContext(scoreMetrics = ScoreMetrics(
            overallScore = 85,
            diversificationScore = 40,
            riskReturnScore = 70,
            liquidityScore = 45,
            concentrationScore = 80,
            stabilityScore = 75,
            recommendations = listOf("Good job")
        ))

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("85"))
    }

    @Test
    fun `buildLocal includes risk level`() {
        val request = JarvisChatRequest(message = "What is my risk?")
        val context = createSampleContext(riskMetrics = RiskMetrics(
            portfolioVolatility = BigDecimal("10.0"),
            sharpeRatio = BigDecimal("1.0"),
            beta = BigDecimal("1.0"),
            maxDrawdown = BigDecimal("5.0"),
            var95 = BigDecimal("2.0"),
            riskScore = 30,
            riskLevel = RiskLevel.LOW
        ))

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("LOW"))
    }

    @Test
    fun `buildLocal includes recommendations`() {
        val request = JarvisChatRequest(message = "What should I do?")
        val context = createSampleContext(recommendations = listOf(
            Recommendation(
                type = RecommendationType.DIVERSIFY,
                title = "Diversify",
                description = "Add more assets",
                priority = 1,
                potentialImpact = BigDecimal("10.0"),
                actionRequired = "Buy ETF"
            )
        ))

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("Diversify"))
        assertTrue(response.reply.contains("Buy ETF"))
    }

    @Test
    fun `buildLocal includes user message`() {
        val request = JarvisChatRequest(message = "Test question")
        val context = createSampleContext()

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("Test question"))
    }

    @Test
    fun `buildLocal includes educational disclaimer`() {
        val request = JarvisChatRequest(message = "Advice?")
        val context = createSampleContext()

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("educacional") || response.reply.contains("não constitui"))
    }

    @Test
    fun `buildLocal suggests action from relevant recommendation`() {
        val request = JarvisChatRequest(message = "How to reduce risk?", message = "risco")
        val context = createSampleContext(recommendations = listOf(
            Recommendation(
                type = RecommendationType.REDUCE_RISK,
                title = "Reduce Risk",
                description = "Your risk is high",
                priority = 1,
                potentialImpact = BigDecimal("5.0"),
                actionRequired = "Buy bonds"
            )
        ))

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("Buy bonds"))
    }

    @Test
    fun `buildLocal includes improvement recommendations from score`() {
        val request = JarvisChatRequest(message = "How to improve?")
        val context = createSampleContext(scoreMetrics = ScoreMetrics(
            overallScore = 75,
            diversificationScore = 35,
            riskReturnScore = 60,
            liquidityScore = 40,
            concentrationScore = 70,
            stabilityScore = 65,
            recommendations = listOf("Add bonds", "Diversify globally", "Increase cash")
        ))

        val response = JarvisReplyBuilder.buildLocal(request, context)

        assertTrue(response.reply.contains("Add bonds"))
    }

    private fun createSampleContext(
        riskMetrics: RiskMetrics = RiskMetrics(
            portfolioVolatility = BigDecimal("15.0"),
            sharpeRatio = BigDecimal("0.8"),
            beta = BigDecimal("1.1"),
            maxDrawdown = BigDecimal("8.0"),
            var95 = BigDecimal("3.0"),
            riskScore = 50,
            riskLevel = RiskLevel.MODERATE
        ),
        scoreMetrics: ScoreMetrics = ScoreMetrics(
            overallScore = 75,
            diversificationScore = 35,
            riskReturnScore = 60,
            liquidityScore = 40,
            concentrationScore = 70,
            stabilityScore = 65,
            recommendations = listOf("Hold position")
        ),
        recommendations: List<Recommendation> = listOf(
            Recommendation(
                type = RecommendationType.HOLD,
                title = "Hold",
                description = "Your portfolio is stable",
                priority = 999,
                potentialImpact = null,
                actionRequired = "Review quarterly"
            )
        )
    ): JarvisChatContext {
        return JarvisChatContext(
            riskMetrics = riskMetrics,
            scoreMetrics = scoreMetrics,
            recommendations = recommendations
        )
    }
}