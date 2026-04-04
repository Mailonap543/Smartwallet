package com.smartwallet.bank.webhook;

import com.smartwallet.bank.classification.TransactionClassificationService
import com.smartwallet.bank.classification.TransactionClassificationService.ClassifiedTransaction
import com.smartwallet.bank.classification.TransactionClassificationService.TransactionType
import com.smartwallet.bank.dto.Transaction
import com.smartwallet.bank.dto.WebhookPayload
import com.smartwallet.dto.asset.CreateAssetRequest
import com.smartwallet.entity.Asset
import com.smartwallet.entity.AssetType
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.service.portfolio.PortfolioService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/webhook")
class BankWebhookController(
    private val classificationService: TransactionClassificationService,
    private val portfolioService: PortfolioService,
    private val walletRepository: WalletRepository,
    private val assetRepository: AssetRepository
) {

    private val log = LoggerFactory.getLogger(BankWebhookController::class.java)

    @PostMapping("/bank")
    fun handleBankWebhook(@RequestBody payload: WebhookPayload): ResponseEntity<Map<String, Any>> {
        log.info("Received webhook: {} for account: {}", payload.eventType(), payload.accountId())

        try {
            when (payload.eventType()) {
                "TRANSACTION_CREATED" -> handleNewTransactions(payload)
                "ACCOUNT_UPDATED" -> handleAccountUpdate(payload)
                "LINK_UPDATED" -> handleLinkUpdate(payload)
                else -> log.warn("Unknown event type: ${payload.eventType()}")
            }

            return ResponseEntity.ok(Map.of("status" to "processed"))
            
        } catch (e: Exception) {
            log.error("Error processing webhook: {}", e.message, e)
            return ResponseEntity.badRequest().body(Map.of("error" to e.message))
        }
    }

    private fun handleNewTransactions(payload: WebhookPayload) {
        val transactions = payload.data()
        
        val classified = classificationService.classifyTransactions(transactions)
        
        log.info("Classified {} transactions", classified.size)

        for (ct in classified) {
            if (ct.isInvestment && ct.transactionType == TransactionType.INVESTMENT_IN) {
                processInvestmentTransaction(ct)
            }
        }

        val incomeTransactions = classified.filter { it.transactionType == TransactionType.INCOME }
        log.info("Found {} income transactions to track", incomeTransactions.size)

        val expenses = classified.filter { it.transactionType == TransactionType.EXPENSE }
        log.info("Found {} expense transactions to categorize", expenses.size)
    }

    private fun processInvestmentTransaction(ct: ClassifiedTransaction) {
        val details = ct.investmentDetails ?: return

        log.info("Processing investment: ${details.assetType} - ${details.amount}")

        // Find user's primary wallet (simplified - would need proper user context)
        val userId = extractUserIdFromTransaction(ct)
        
        // For now, create investment proposal - in real implementation would save to DB
        val proposal = classificationService.convertToAssetProposal(ct, userId, 1L)
        
        log.info("Investment proposal created: {}", proposal)
    }

    private fun extractUserIdFromTransaction(ct: ClassifiedTransaction): Long {
        // In real implementation, would extract from account_id mapping
        return 1L
    }

    private fun handleAccountUpdate(payload: WebhookPayload) {
        log.info("Account updated: ${payload.accountId()}")
    }

    private fun handleLinkUpdate(payload: WebhookPayload) {
        log.info("Link status changed for account: ${payload.accountId()}")
    }
}