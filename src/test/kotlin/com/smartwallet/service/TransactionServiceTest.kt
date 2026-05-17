package com.smartwallet.service

import com.smartwallet.dto.transaction.CreateTransactionRequest
import com.smartwallet.entity.Asset
import com.smartwallet.entity.Transaction
import com.smartwallet.entity.Transaction.TransactionType
import com.smartwallet.entity.User
import com.smartwallet.entity.Wallet
import com.smartwallet.exception.ResourceNotFoundException
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.TransactionRepository
import com.smartwallet.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.LocalDateTime

class TransactionServiceTest {

    private lateinit var transactionService: TransactionService
    private lateinit var transactionRepository: TransactionRepository
    private lateinit var assetRepository: AssetRepository
    private lateinit var userRepository: UserRepository

    private val userId = 1L
    private val assetId = 1L
    private val transactionId = 1L

    @BeforeEach
    fun setup() {
        transactionRepository = mock()
        assetRepository = mock()
        userRepository = mock()
        transactionService = TransactionService(transactionRepository, assetRepository, userRepository)
    }

    @Test
    fun `createTransaction recalculates asset after creation`() {
        val wallet = createWallet()
        val asset = createAsset(wallet, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)

        val request = CreateTransactionRequest(
            TransactionType.BUY,
            BigDecimal("10"),
            BigDecimal("150.00"),
            BigDecimal("5.00"),
            LocalDateTime.now(),
            "Test"
        )

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(assetRepository.findById(assetId)).thenReturn(java.util.Optional.of(asset))
        var savedTransaction: Transaction? = null
        whenever(transactionRepository.save(any())).thenAnswer {
            savedTransaction = it.getArgument(0)
            savedTransaction
        }
        whenever(transactionRepository.findByAssetIdOrderedByDateDesc(assetId)).thenAnswer {
            listOf(savedTransaction!!)
        }

        val response = transactionService.createTransaction(userId, assetId, request)

        verify(assetRepository).save(asset)
        assertTrue(asset.quantity.compareTo(BigDecimal("10")) == 0)
    }

    @Test
    fun `updateTransaction recalculates asset after update`() {
        val wallet = createWallet()
        val asset = createAsset(wallet, BigDecimal("5"), BigDecimal("150.00"), BigDecimal("750.00"), BigDecimal("800.00"))

        val transaction = createTransaction(asset, BigDecimal("5"), BigDecimal("150.00"), BigDecimal("750.00"))

        val request = CreateTransactionRequest(
            TransactionType.BUY,
            BigDecimal("15"),
            BigDecimal("160.00"),
            BigDecimal("10.00"),
            LocalDateTime.now(),
            "Updated"
        )

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.of(transaction))
        whenever(transactionRepository.save(any())).thenAnswer { it.getArgument(0) }

        val response = transactionService.updateTransaction(userId, transactionId, request)

        verify(assetRepository).save(asset)
    }

    @Test
    fun `deleteTransaction recalculates asset after deletion`() {
        val wallet = createWallet()
        val asset = createAsset(wallet, BigDecimal("10"), BigDecimal("150.00"), BigDecimal("1500.00"), BigDecimal("1600.00"))

        val transaction = createTransaction(asset, BigDecimal("10"), BigDecimal("150.00"), BigDecimal("1500.00"))

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.of(transaction))

        transactionService.deleteTransaction(userId, transactionId)

        verify(transactionRepository).delete(transaction)
        verify(assetRepository).save(asset)
    }

    @Test
    fun `deleteTransaction throws exception for non-existent transaction`() {
        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.empty())

        assertThrows(ResourceNotFoundException::class.java) {
            transactionService.deleteTransaction(userId, transactionId)
        }
    }

    @Test
    fun `getTransactionById returns transaction`() {
        val wallet = createWallet()
        val asset = createAsset(wallet)
        val transaction = createTransaction(asset)

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.of(transaction))

        val response = transactionService.getTransactionById(userId, transactionId)

        assertEquals(transactionId, response.id)
    }

    @Test
    fun `getAllTransactionsByUserId returns list`() {
        val wallet = createWallet()
        val asset = createAsset(wallet)
        val transaction = createTransaction(asset)

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findByUserId(userId)).thenReturn(listOf(transaction))

        val response = transactionService.getAllTransactionsByUserId(userId)

        assertEquals(1, response.size)
    }

    @Test
    fun `recalculateAssetFromTransactions handles empty transactions`() {
        val wallet = createWallet()
        val asset = createAsset(wallet).apply {
            quantity = BigDecimal("10")
        }

        whenever(transactionRepository.findByAssetIdOrderedByDateDesc(assetId)).thenReturn(emptyList())
        whenever(assetRepository.save(any())).thenAnswer { it.getArgument(0) }

        transactionService.recalculateAssetFromTransactions(asset)

        assertTrue(asset.quantity.compareTo(BigDecimal.ZERO) == 0)
    }

    private fun createUser(): User = User().apply {
        id = userId
        email = "test@example.com"
        passwordHash = "password"
        fullName = "Test User"
        isActive = true
        emailVerified = true
        role = "USER"
    }

    private fun createWallet(): Wallet = Wallet().apply {
        id = 1L
        user = createUser()
        name = "Test Wallet"
        totalBalance = BigDecimal.ZERO
        totalInvested = BigDecimal.ZERO
        totalProfitLoss = BigDecimal.ZERO
        createdAt = LocalDateTime.now()
        updatedAt = LocalDateTime.now()
    }

    private fun createAsset(
        wallet: Wallet,
        quantity: BigDecimal = BigDecimal.ZERO,
        averagePrice: BigDecimal = BigDecimal.ZERO,
        totalInvested: BigDecimal = BigDecimal.ZERO,
        currentValue: BigDecimal = BigDecimal.ZERO
    ): Asset = Asset().apply {
        id = assetId
        symbol = "AAPL"
        name = "Apple"
        this.wallet = wallet
        this.quantity = quantity
        this.averagePrice = averagePrice
        purchasePrice = averagePrice
        this.totalInvested = totalInvested
        this.currentValue = currentValue
    }

    private fun createTransaction(
        asset: Asset,
        quantity: BigDecimal = BigDecimal.ZERO,
        price: BigDecimal = BigDecimal.ZERO,
        totalValue: BigDecimal = BigDecimal.ZERO
    ): Transaction = Transaction().apply {
        id = transactionId
        this.asset = asset
        transactionType = TransactionType.BUY
        this.quantity = quantity
        this.price = price
        this.totalValue = totalValue
        transactionDate = LocalDateTime.now()
    }
}
