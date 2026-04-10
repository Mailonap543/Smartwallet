package com.smartwallet.portfolio.web

import com.smartwallet.common.ApiResponse
import com.smartwallet.audit.service.AuditService
import com.smartwallet.common.CurrentUser
import com.smartwallet.portfolio.model.PortfolioAsset
import com.smartwallet.portfolio.model.Transaction
import com.smartwallet.portfolio.model.Wallet
import com.smartwallet.portfolio.service.WalletService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate

@RestController
@RequestMapping(value = ["/api", "/api/v1"])
class WalletController(
    private val walletService: WalletService,
    private val currentUser: CurrentUser,
    private val audit: AuditService
) {

    private fun userId(): Long = currentUser.id()

    @GetMapping("/wallets")
    fun wallets(): ApiResponse<List<Wallet>> =
        ApiResponse(data = walletService.listWallets(userId()))

    @PostMapping("/wallets")
    fun create(@RequestBody body: WalletRequest): ApiResponse<Wallet> =
        ApiResponse(data = walletService.createWallet(userId(), body.name, body.description)).also {
            audit.log(userId(), "CREATE_WALLET", "Wallet", it.data?.id)
        }

    @GetMapping("/wallets/{id}")
    fun get(@PathVariable id: Long): ApiResponse<Wallet> =
        ApiResponse(data = walletService.getWallet(id))

    @PutMapping("/wallets/{id}")
    fun update(@PathVariable id: Long, @RequestBody body: WalletRequest): ApiResponse<Wallet> =
        ApiResponse(data = walletService.updateWallet(id, body.name, body.description)).also {
            audit.log(userId(), "UPDATE_WALLET", "Wallet", id)
        }

    @DeleteMapping("/wallets/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        walletService.deleteWallet(id)
        audit.log(userId(), "DELETE_WALLET", "Wallet", id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/portfolio/wallets/{walletId}/assets")
    fun assets(@PathVariable walletId: Long): ApiResponse<List<PortfolioAsset>> =
        ApiResponse(data = walletService.listAssets(walletId))

    @PostMapping("/portfolio/wallets/{walletId}/assets")
    fun addAsset(@PathVariable walletId: Long, @RequestBody body: AddAssetRequest): ApiResponse<PortfolioAsset> =
        ApiResponse(
            data = walletService.addAsset(
                walletId,
                body.symbol,
                body.name,
                body.assetType,
                body.quantity,
                body.purchasePrice,
                body.purchaseDate
            )
        ).also { audit.log(userId(), "ADD_ASSET", "PortfolioAsset", it.data?.id) }

    @GetMapping("/portfolio/assets/{assetId}/transactions")
    fun transactions(@PathVariable assetId: Long): ApiResponse<List<Transaction>> =
        ApiResponse(data = walletService.listTransactions(assetId))

    @PostMapping("/portfolio/assets/{assetId}/transactions")
    fun addTransaction(@PathVariable assetId: Long, @RequestBody body: AddTransactionRequest): ApiResponse<Transaction> =
        ApiResponse(
            data = walletService.addTransaction(
                assetId,
                body.transactionType,
                body.quantity,
                body.price,
                body.fees
            )
        ).also { audit.log(userId(), "ADD_TRANSACTION", "Transaction", it.data?.id) }
}

data class WalletRequest(
    val name: String,
    val description: String? = null
)

data class AddAssetRequest(
    val symbol: String,
    val name: String,
    val assetType: String,
    val quantity: BigDecimal,
    val purchasePrice: BigDecimal,
    val purchaseDate: LocalDate
)

data class AddTransactionRequest(
    val transactionType: String,
    val quantity: BigDecimal,
    val price: BigDecimal,
    val fees: BigDecimal? = null
)
