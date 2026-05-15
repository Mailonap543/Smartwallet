package com.smartwallet.service

import com.smartwallet.dto.transaction.CreateTransactionRequest
import com.smartwallet.entity.Asset
import com.smartwallet.entity.Transaction
import com.smartwallet.entity.Transaction.TransactionType
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
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(
            id = assetId,
            symbol = "AAPL",
            wallet = wallet,
            quantity = BigDecimal.ZERO,
            averagePrice = BigDecimal.ZERO,
            totalInvested = BigDecimal.ZERO,
            currentValue = BigDecimal.ZERO
        )

        val request = CreateTransactionRequest(
            transactionType = TransactionType.BUY,
            quantity = BigDecimal("10"),
            price = BigDecimal("150.00"),
            fees = BigDecimal("5.00"),
            transactionDate = LocalDateTime.now(),
            notes = "Test"
        )

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(assetRepository.findById(assetId)).thenReturn(java.util.Optional.of(asset))
        whenever(transactionRepository.save(any())).thenAnswer { it.getArgument(0) }

        val response = transactionService.createTransaction(userId, assetId, request)

        verify(assetRepository).save(asset)
        assertTrue(asset.quantity.compareTo(BigDecimal("10")) == 0)
    }

    @Test
    fun `updateTransaction recalculates asset after update`() {
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(
            id = assetId,
            symbol = "AAPL",
            wallet = wallet,
            quantity = BigDecimal("5"),
            averagePrice = BigDecimal("150.00"),
            totalInvested = BigDecimal("750.00"),
            currentValue = BigDecimal("800.00")
        )

        val transaction = Transaction(
            id = transactionId,
            asset = asset,
            transactionType = TransactionType.BUY,
            quantity = BigDecimal("5"),
            price = BigDecimal("150.00"),
            totalValue = BigDecimal("750.00"),
            transactionDate = LocalDateTime.now()
        )

        val request = CreateTransactionRequest(
            transactionType = TransactionType.BUY,
            quantity = BigDecimal("15"),
            price = BigDecimal("160.00"),
            fees = BigDecimal("10.00"),
            transactionDate = LocalDateTime.now(),
            notes = "Updated"
        )

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.of(transaction))
        whenever(transactionRepository.save(any())).thenAnswer { it.getArgument(0) }

        val response = transactionService.updateTransaction(userId, transactionId, request)

        verify(assetRepository).save(asset)
    }

    @Test
    fun `deleteTransaction recalculates asset after deletion`() {
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(
            id = assetId,
            symbol = "AAPL",
            wallet = wallet,
            quantity = BigDecimal("10"),
            averagePrice = BigDecimal("150.00"),
            totalInvested = BigDecimal("1500.00"),
            currentValue = BigDecimal("1600.00")
        )

        val transaction = Transaction(
            id = transactionId,
            asset = asset,
            transactionType = TransactionType.BUY,
            quantity = BigDecimal("10"),
            price = BigDecimal("150.00"),
            totalValue = BigDecimal("1500.00"),
            transactionDate = LocalDateTime.now()
        )

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
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(id = assetId, symbol = "AAPL", wallet = wallet)
        val transaction = Transaction(id = transactionId, asset = asset)

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findById(transactionId)).thenReturn(java.util.Optional.of(transaction))

        val response = transactionService.getTransactionById(userId, transactionId)

        assertEquals(transactionId, response.id)
    }

    @Test
    fun `getAllTransactionsByUserId returns list`() {
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(id = assetId, symbol = "AAPL", wallet = wallet)
        val transaction = Transaction(id = transactionId, asset = asset)

        whenever(userRepository.existsById(userId)).thenReturn(true)
        whenever(transactionRepository.findByUserId(userId)).thenReturn(listOf(transaction))

        val response = transactionService.getAllTransactionsByUserId(userId)

        assertEquals(1, response.size)
    }

    @Test
    fun `recalculateAssetFromTransactions handles empty transactions`() {
        val wallet = Wallet(id = 1L, user = com.smartwallet.entity.User(id = userId))
        val asset = Asset(
            id = assetId,
            symbol = "AAPL",
            wallet = wallet,
            quantity = BigDecimal("10")
        )

        whenever(transactionRepository.findByAssetIdOrderedByDateDesc(assetId)).thenReturn(emptyList())
        whenever(assetRepository.save(any())).thenAnswer { it.getArgument(0) }

        transactionService.recalculateAssetFromTransactions(asset)

        assertTrue(asset.quantity.compareTo(BigDecimal.ZERO) == 0)
    }
}