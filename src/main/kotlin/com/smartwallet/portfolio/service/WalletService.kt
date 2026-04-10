package com.smartwallet.portfolio.service

import com.smartwallet.common.NotFoundException
import com.smartwallet.portfolio.model.PortfolioAsset
import com.smartwallet.portfolio.model.Transaction
import com.smartwallet.portfolio.model.Wallet
import com.smartwallet.portfolio.repository.PortfolioAssetRepository
import com.smartwallet.portfolio.repository.TransactionRepository
import com.smartwallet.portfolio.repository.WalletRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
class WalletService(
    private val walletRepo: WalletRepository,
    private val assetRepo: PortfolioAssetRepository,
    private val txRepo: TransactionRepository
) {

    @Transactional(readOnly = true)
    fun listWallets(userId: Long): List<Wallet> = walletRepo.findAllByUserId(userId)

    @Transactional(readOnly = true)
    fun getWallet(id: Long): Wallet =
        walletRepo.findById(id).orElseThrow { NotFoundException("Wallet not found") }

    @Transactional
    fun createWallet(userId: Long, name: String, description: String?): Wallet =
        walletRepo.save(Wallet(userId = userId, name = name, description = description))

    @Transactional
    fun updateWallet(id: Long, name: String?, description: String?): Wallet {
        val existing = getWallet(id)
        val updated = existing.copy(
            name = name ?: existing.name,
            description = description ?: existing.description
        )
        return walletRepo.save(updated)
    }

    @Transactional
    fun deleteWallet(id: Long) = walletRepo.deleteById(id)

    @Transactional(readOnly = true)
    fun listAssets(walletId: Long): List<PortfolioAsset> =
        assetRepo.findAllByWallet(getWallet(walletId))

    @Transactional
    fun addAsset(walletId: Long, symbol: String, name: String, assetType: String, quantity: BigDecimal, purchasePrice: BigDecimal, purchaseDate: LocalDate): PortfolioAsset {
        val wallet = getWallet(walletId)
        val asset = PortfolioAsset(
            wallet = wallet,
            symbol = symbol,
            name = name,
            assetType = assetType,
            quantity = quantity,
            purchasePrice = purchasePrice,
            currentPrice = purchasePrice,
            purchaseDate = purchaseDate
        )
        return assetRepo.save(asset)
    }

    @Transactional(readOnly = true)
    fun listTransactions(assetId: Long): List<Transaction> =
        txRepo.findAllByAsset(getAsset(assetId))

    @Transactional
    fun addTransaction(assetId: Long, transactionType: String, quantity: BigDecimal, price: BigDecimal, fees: BigDecimal?): Transaction {
        val asset = getAsset(assetId)
        val tx = Transaction(
            asset = asset,
            transactionType = transactionType,
            quantity = quantity,
            price = price,
            totalValue = quantity.multiply(price),
            fees = fees
        )
        return txRepo.save(tx)
    }

    private fun getAsset(assetId: Long): PortfolioAsset =
        assetRepo.findById(assetId).orElseThrow { NotFoundException("Asset not found") }
}
