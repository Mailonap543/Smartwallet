package com.smartwallet.watchlist.web

import com.smartwallet.audit.service.AuditService
import com.smartwallet.common.ApiResponse
import com.smartwallet.watchlist.model.Alert
import com.smartwallet.watchlist.model.Watchlist
import com.smartwallet.watchlist.model.WatchlistItem
import com.smartwallet.watchlist.service.WatchlistService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping(value = ["/api", "/api/v1"])
class WatchlistController(
    private val watchlistService: WatchlistService,
    private val audit: AuditService
) {

    // Favorites
    @GetMapping("/watchlist/favorites")
    fun favorites(): ApiResponse<List<WatchlistItem>> =
        ApiResponse(data = watchlistService.favorites())

    @PostMapping("/watchlist/favorite/{symbol}")
    fun addFavorite(@PathVariable symbol: String): ApiResponse<Void> {
        watchlistService.addFavorite(symbol)
        audit.log(null, "ADD_FAVORITE", "Favorite", null)
        return ApiResponse(data = null)
    }

    @DeleteMapping("/watchlist/favorite/{symbol}")
    fun removeFavorite(@PathVariable symbol: String): ApiResponse<Void> {
        watchlistService.removeFavorite(symbol)
        audit.log(null, "REMOVE_FAVORITE", "Favorite", null)
        return ApiResponse(data = null)
    }

    // Watchlists
    @GetMapping("/watchlist")
    fun watchlists(): ApiResponse<List<Watchlist>> =
        ApiResponse(data = watchlistService.watchlists())

    @PostMapping("/watchlist")
    fun create(@RequestBody body: CreateWatchlistRequest): ApiResponse<Watchlist> =
        ApiResponse(data = watchlistService.createWatchlist(body.name)).also {
            audit.log(null, "CREATE_WATCHLIST", "Watchlist", it.data?.id)
        }

    @GetMapping("/watchlist/{id}/items")
    fun items(@PathVariable id: Long): ApiResponse<List<WatchlistItem>> =
        ApiResponse(data = watchlistService.items(id))

    @PostMapping("/watchlist/{id}/items")
    fun addItem(@PathVariable id: Long, @RequestBody body: AddWatchlistItemRequest): ApiResponse<WatchlistItem> =
        ApiResponse(data = watchlistService.addItem(id, body.symbol)).also {
            audit.log(null, "ADD_WATCHLIST_ITEM", "WatchlistItem", it.data?.id)
        }

    @DeleteMapping("/watchlist/{id}/items/{symbol}")
    fun removeItem(@PathVariable id: Long, @PathVariable symbol: String): ResponseEntity<Void> {
        watchlistService.removeItem(id, symbol)
        return ResponseEntity.noContent().build()
    }

    // Alerts
    @GetMapping("/alerts")
    fun alerts(): ApiResponse<List<Alert>> = ApiResponse(data = watchlistService.alerts())

    @PostMapping("/alerts")
    fun createAlert(@RequestBody body: CreateAlertRequest): ApiResponse<Alert> =
        ApiResponse(data = watchlistService.createAlert(body.symbol, body.alertType, body.targetValue))

    @DeleteMapping("/alerts/{id}")
    fun deleteAlert(@PathVariable id: Long): ResponseEntity<Void> {
        watchlistService.deleteAlert(id)
        audit.log(null, "DELETE_ALERT", "Alert", id)
        return ResponseEntity.noContent().build()
    }
}

data class CreateWatchlistRequest(val name: String)
data class AddWatchlistItemRequest(val symbol: String)
data class CreateAlertRequest(val symbol: String, val alertType: String, val targetValue: BigDecimal? = null)
