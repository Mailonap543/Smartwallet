package com.smartwallet.bank.classification

import com.smartwallet.bank.dto.Transaction
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Service
class TransactionClassificationService {

    private val log = LoggerFactory.getLogger(TransactionClassificationService::class.java)

    private val investmentKeywords = listOf(
        "corretora", "b3", "bolsa", "nubank invests", "tesouro", "cdb", "lci", "lca",
        "fundos", "renda fixa", "debenture", "cnpj", "cvm", "bdr", "etf", "fiis",
        "investimento", "aplicação", "resgate", "lucro", "dividendos", "juros"
    )

    private val incomeKeywords = listOf(
        "salário", "salario", "pix recebido", "transferência recebida", "depósito",
        "recebimento", "transferência", "devolução", "estorno", "reembolso"
    )

    private val expenseKeywords = listOf(
        "mercado", "supermercado", "lanchonete", "restaurante", "farmácia", "farmacia",
        "uber", "99", "didi", "spotify", "netflix", "amazon", "magazine", "magazine luiza",
        "magazine luiza", "casas bahia", "ponto frio", "ifood", "rappi", "delivery"
    )

    private val transferKeywords = listOf(
        "transferência", "pix", "ted", "doc", "envio", "recebimento entre contas"
    )

    data class ClassifiedTransaction(
        val originalTransaction: Transaction,
        val transactionType: TransactionType,
        val category: String,
        val confidence: Double,
        val isInvestment: Boolean,
        val investmentDetails: InvestmentDetails?
    )

    data class InvestmentDetails(
        val assetSymbol: String?,
        val assetType: AssetType?,
        val amount: BigDecimal,
        val institution: String?,
        val detectedAt: LocalDateTime
    )

    enum class TransactionType {
        INVESTMENT_IN,     // Compra de investimento
        INVESTMENT_OUT,    // Venda de investimento
        INCOME,            // Receita (salário, depósitos)
        EXPENSE,           // Despesa normal
        TRANSFER_IN,       // Transferência recebida
        TRANSFER_OUT,      // Transferência enviada
        UNKNOWN
    }

    enum class AssetType {
        STOCK,       // Ações
        ETF,         // ETFs
        FII,         // Fundos Imobiliários
        CRYPTO,      // Criptomoedas
        BOND,        // Renda Fixa
        FUND,        // Fundos de Investimento
        SAVINGS,     // Poupança
        OTHER
    }

    fun classifyTransaction(transaction: Transaction): ClassifiedTransaction {
        log.debug("Classifying transaction: ${transaction.description()}")

        val description = transaction.description()?.lowercase() ?: ""
        val amount = transaction.amount()
        val isCredit = amount.compareTo(BigDecimal.ZERO) > 0

        // First, check for investment-related keywords
        val investmentMatch = investmentKeywords.any { description.contains(it) }
        
        if (investmentMatch) {
            return classifyAsInvestment(transaction, description, amount, isCredit)
        }

        // Check for income
        if (isCredit && incomeKeywords.any { description.contains(it) }) {
            return ClassifiedTransaction(
                originalTransaction = transaction,
                transactionType = TransactionType.INCOME,
                category = "Receita",
                confidence = 0.85,
                isInvestment = false,
                investmentDetails = null
            )
        }

        // Check for transfer
        if (transferKeywords.any { description.contains(it) }) {
            return ClassifiedTransaction(
                originalTransaction = transaction,
                transactionType = if (isCredit) TransactionType.TRANSFER_IN else TransactionType.TRANSFER_OUT,
                category = "Transferência",
                confidence = 0.80,
                isInvestment = false,
                investmentDetails = null
            )
        }

        // Check for expense
        if (!isCredit && expenseKeywords.any { description.contains(it) }) {
            val category = detectExpenseCategory(description)
            return ClassifiedTransaction(
                originalTransaction = transaction,
                transactionType = TransactionType.EXPENSE,
                category = category,
                confidence = 0.75,
                isInvestment = false,
                investmentDetails = null
            )
        }

        // Default classification
        return ClassifiedTransaction(
            originalTransaction = transaction,
            transactionType = if (isCredit) TransactionType.INCOME else TransactionType.EXPENSE,
            category = "Outros",
            confidence = 0.30,
            isInvestment = false,
            investmentDetails = null
        )
    }

    private fun classifyAsInvestment(
        transaction: Transaction,
        description: String,
        amount: BigDecimal,
        isCredit: Boolean
    ): ClassifiedTransaction {
        val (assetType, symbol) = detectInvestmentType(description)
        
        val investmentDetails = InvestmentDetails(
            assetSymbol = symbol,
            assetType = assetType,
            amount = amount.abs(),
            institution = extractInstitution(description),
            detectedAt = LocalDateTime.now()
        )

        return ClassifiedTransaction(
            originalTransaction = transaction,
            transactionType = if (isCredit) TransactionType.INVESTMENT_OUT else TransactionType.INVESTMENT_IN,
            category = "Investimento - ${assetType.name}",
            confidence = 0.90,
            isInvestment = true,
            investmentDetails = investmentDetails
        )
    }

    private fun detectInvestmentType(description: String): Pair<AssetType, String?> {
        return when {
            description.contains("fiis") || description.contains("fii") -> AssetType.FII to null
            description.contains("ações") || description.contains("b3") -> AssetType.STOCK to null
            description.contains("etf") -> AssetType.ETF to null
            description.contains("crypto") || description.contains("bitcoin") -> AssetType.CRYPTO to null
            description.contains("tesouro") || description.contains("renda fixa") -> AssetType.BOND to null
            description.contains("fundo") -> AssetType.FUND to null
            description.contains("poupança") -> AssetType.SAVINGS to null
            else -> AssetType.OTHER to null
        }
    }

    private fun detectExpenseCategory(description: String): String {
        return when {
            description.contains("mercado") || description.contains("supermercado") -> "Alimentação"
            description.contains("uber") || description.contains("99") || description.contains("didi") -> "Transporte"
            description.contains("netflix") || description.contains("spotify") -> "Entretenimento"
            description.contains("farmácia") || description.contains("farmacia") -> "Saúde"
            else -> "Outros"
        }
    }

    private fun extractInstitution(description: String): String? {
        val institutions = listOf("nubank", "itau", "bradesco", "safra", "santander", "bb")
        return institutions.find { description.contains(it) }
    }

    fun classifyTransactions(transactions: List<Transaction>): List<ClassifiedTransaction> {
        return transactions.map { classifyTransaction(it) }
    }

    fun extractInvestmentTransactions(classified: List<ClassifiedTransaction>): List<ClassifiedTransaction> {
        return classified.filter { it.isInvestment }
    }

    fun convertToAssetProposal(
        classified: ClassifiedTransaction,
        userId: Long,
        walletId: Long
    ): Map<String, Any> {
        if (!classified.isInvestment || classified.investmentDetails == null) {
            throw IllegalArgumentException("Transaction is not an investment")
        }

        val details = classified.investmentDetails

        return mapOf(
            "walletId" to walletId,
            "userId" to userId,
            "symbol" to (details.assetSymbol ?: "UNKNOWN"),
            "name" to classified.category,
            "assetType" to (details.assetType ?: AssetType.OTHER).name,
            "quantity" to 1.0,
            "purchasePrice" to details.amount,
            "purchaseDate" to classified.originalTransaction.date().toLocalDate().toString(),
            "currentPrice" to details.amount,
            "investmentInstitution" to details.institution
        )
    }
}