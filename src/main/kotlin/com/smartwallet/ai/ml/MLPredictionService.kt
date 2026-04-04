package com.smartwallet.ai.ml

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(name = "ai.ml.enabled", havingValue = "false")
class MLPredictionService {

    private val log = LoggerFactory.getLogger(MLPredictionService::class.java)

    fun predictPrice(symbol: String, historicalData: List<Double>): Double? {
        log.info("ML prediction not enabled. Configure ai.ml.enabled=true to activate.")
        return null
    }

    fun trainModel(data: List<Map<String, Any>>): Boolean {
        log.info("ML training not enabled. Configure ai.ml.enabled=true to activate.")
        return false
    }

    fun getModelStatus(): Map<String, Any> {
        return mapOf(
            "enabled" to false,
            "status" to "NOT_INITIALIZED",
            "message" to "Configure ai.ml.enabled=true in application.yaml to enable ML features"
        )
    }
}