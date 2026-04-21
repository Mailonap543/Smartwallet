package com.smartwallet.bank.webhook

import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal

data class WebhookPayload(
    val eventType: String,
    val accountId: String,
    val data: List<TransactionData>? = null
)

data class TransactionData(
    val id: String,
    val amount: BigDecimal,
    val type: String
)

@RestController
@RequestMapping("/api/webhook")
class BankWebhookController {

    private val log = LoggerFactory.getLogger(BankWebhookController::class.java)

    @PostMapping("/bank")
    fun handleBankWebhook(@RequestBody payload: WebhookPayload): ResponseEntity<Map<String, Any>> {
        log.info("Received webhook: ${payload.eventType} for account: ${payload.accountId}")

        try {
            when (payload.eventType) {
                "TRANSACTION_CREATED" -> log.info("Processing transactions")
                "ACCOUNT_UPDATED" -> log.info("Account updated")
                "LINK_UPDATED" -> log.info("Link updated")
                else -> log.warn("Unknown event type: ${payload.eventType}")
            }

            return ResponseEntity.ok(mapOf("status" to "processed"))
        } catch (e: Exception) {
            log.error("Error processing webhook: ${e.message}", e)
            return ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Unknown error")))
        }
    }
}