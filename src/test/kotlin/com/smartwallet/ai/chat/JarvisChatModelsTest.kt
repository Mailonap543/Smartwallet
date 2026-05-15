package com.smartwallet.ai.chat

import com.smartwallet.ai.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class JarvisChatModelsTest {

    @Test
    fun `JarvisChatRequest can be created with all fields`() {
        val request = JarvisChatRequest(
            message = "Hello Jarvis",
            sessionId = "test-session-123"
        )

        assertEquals("Hello Jarvis", request.message)
        assertEquals("test-session-123", request.sessionId)
    }

    @Test
    fun `JarvisChatRequest handles null sessionId`() {
        val request = JarvisChatRequest(message = "Test", sessionId = null)

        assertEquals("Test", request.message)
        assertNull(request.sessionId)
    }

    @Test
    fun `JarvisChatResponse can be created with all fields`() {
        val response = JarvisChatResponse(
            reply = "Hello back!",
            sessionId = "session-456"
        )

        assertEquals("Hello back!", response.reply)
        assertEquals("session-456", response.sessionId)
    }

    @Test
    fun `JarvisChatContext can be created with all fields`() {
        val context = JarvisChatContext(
            riskMetrics = RiskMetrics(
                portfolioVolatility = BigDecimal("15.0"),
                sharpeRatio = BigDecimal("0.8"),
                beta = BigDecimal("1.1"),
                maxDrawdown = BigDecimal("8.0"),
                var95 = BigDecimal("3.0"),
                riskScore = 50,
                riskLevel = RiskLevel.MODERATE
            ),
            scoreMetrics = ScoreMetrics(
                overallScore = 75,
                diversificationScore = 35,
                riskReturnScore = 60,
                liquidityScore = 40,
                concentrationScore = 70,
                stabilityScore = 65,
                recommendations = listOf("Test")
            ),
            recommendations = emptyList()
        )

        assertEquals(RiskLevel.MODERATE, context.riskMetrics.riskLevel)
        assertEquals(75, context.scoreMetrics.overallScore)
    }

    @Test
    fun `PythonJarvisChatRequest can be created`() {
        val payload = PythonJarvisChatRequest(
            message = "Test",
            sessionId = "session-789",
            context = JarvisChatContext(
                riskMetrics = RiskMetrics(
                    portfolioVolatility = BigDecimal("10.0"),
                    sharpeRatio = BigDecimal("1.0"),
                    beta = BigDecimal("1.0"),
                    maxDrawdown = BigDecimal("5.0"),
                    var95 = BigDecimal("2.0"),
                    riskScore = 40,
                    riskLevel = RiskLevel.LOW
                ),
                scoreMetrics = ScoreMetrics(
                    overallScore = 80,
                    diversificationScore = 40,
                    riskReturnScore = 65,
                    liquidityScore = 45,
                    concentrationScore = 75,
                    stabilityScore = 70,
                    recommendations = emptyList()
                ),
                recommendations = emptyList()
            )
        )

        assertEquals("Test", payload.message)
        assertEquals("session-789", payload.sessionId)
    }

    @Test
    fun `PythonJarvisChatResponse can be created`() {
        val response = PythonJarvisChatResponse(
            reply = "Python response",
            sessionId = "new-session"
        )

        assertEquals("Python response", response.reply)
        assertEquals("new-session", response.sessionId)
    }
}