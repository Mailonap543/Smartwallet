package com.smartwallet.ai.ml

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MLPredictionServiceTest {

    private lateinit var mlPredictionService: MLPredictionService

    @BeforeEach
    fun setup() {
        mlPredictionService = MLPredictionService()
    }

    @Test
    fun `predictPrice returns null when not enabled`() {
        val result = mlPredictionService.predictPrice("AAPL", listOf(1.0, 2.0, 3.0))

        assertNull(result)
    }

    @Test
    fun `trainModel returns false when not enabled`() {
        val trainingData = listOf(
            mapOf("symbol" to "AAPL", "price" to 150.0)
        )

        val result = mlPredictionService.trainModel(trainingData)

        assertFalse(result)
    }

    @Test
    fun `getModelStatus returns disabled status`() {
        val status = mlPredictionService.getModelStatus()

        assertFalse(status["enabled"] as Boolean)
        assertEquals("NOT_INITIALIZED", status["status"])
        assertNotNull(status["message"])
    }

    @Test
    fun `getModelStatus contains all required fields`() {
        val status = mlPredictionService.getModelStatus()

        assertTrue(status.containsKey("enabled"))
        assertTrue(status.containsKey("status"))
        assertTrue(status.containsKey("message"))
    }

    @Test
    fun `predictPrice handles empty data`() {
        val result = mlPredictionService.predictPrice("AAPL", emptyList())

        assertNull(result)
    }

    @Test
    fun `predictPrice handles null symbol`() {
        val result = mlPredictionService.predictPrice("", emptyList())

        assertNull(result)
    }

    @Test
    fun `trainModel handles empty data`() {
        val result = mlPredictionService.trainModel(emptyList())

        assertFalse(result)
    }
}
