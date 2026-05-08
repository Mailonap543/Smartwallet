package com.smartwallet.bank.classification

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal

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
        "casas bahia", "ponto frio", "ifood", "rappi", "delivery"
    )

    data class TransactionInput(
        val id: String,
        val amount: BigDecimal,
        val description: String?,
        val date: String?
    )

    data class ClassifiedTransaction(
        val transactionId: String,
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
        val institution: String?
    )

    enum class TransactionType {
        INVESTMENT_IN, INVESTMENT_OUT, INCOME, EXPENSE, TRANSFER_IN, TRANSFER_OUT, UNKNOWN
    }

    enum class AssetType {
        STOCK, ETF, FII, CRYPTO, BOND, FUND, SAVINGS, OTHER
    }

    fun classifyTransaction(transaction: TransactionInput): ClassifiedTransaction {
        val description = transaction.description?.lowercase() ?: ""
        val amount = transaction.amount
        val isCredit = amount.compareTo(BigDecimal.ZERO) > 0

        val investmentMatch = investmentKeywords.any { description.contains(it) }
        
        if (investmentMatch) {
            return ClassifiedTransaction(
                transactionId = transaction.id,
                transactionType = if (isCredit) TransactionType.INVESTMENT_OUT else TransactionType.INVESTMENT_IN,
                category = "Investimento",
                confidence = 0.90,
                isInvestment = true,
                investmentDetails = InvestmentDetails(
                    assetSymbol = null,
                    assetType = AssetType.OTHER,
                    amount = amount.abs(),
                    institution = null
                )
            )
        }

        if (isCredit && incomeKeywords.any { description.contains(it) }) {
            return ClassifiedTransaction(
                transactionId = transaction.id,
                transactionType = TransactionType.INCOME,
                category = "Receita",
                confidence = 0.85,
                isInvestment = false,
                investmentDetails = null
            )
        }

        if (!isCredit && expenseKeywords.any { description.contains(it) }) {
            return ClassifiedTransaction(
                transactionId = transaction.id,
                transactionType = TransactionType.EXPENSE,
                category = "Despesa",
                confidence = 0.75,
                isInvestment = false,
                investmentDetails = null
            )
        }

        return ClassifiedTransaction(
            transactionId = transaction.id,
            transactionType = if (isCredit) TransactionType.INCOME else TransactionType.EXPENSE,
            category = "Outros",
            confidence = 0.30,
            isInvestment = false,
            investmentDetails = null
        )
    }

    fun classifyTransactions(transactions: List<TransactionInput>): List<ClassifiedTransaction> {
        return transactions.map { classifyTransaction(it) }
    }
}