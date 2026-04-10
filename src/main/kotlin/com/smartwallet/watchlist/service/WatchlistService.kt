package com.smartwallet.watchlist.service

import com.smartwallet.common.CurrentUser
import com.smartwallet.common.NotFoundException
import com.smartwallet.watchlist.model.Alert
import com.smartwallet.watchlist.model.Watchlist
import com.smartwallet.watchlist.model.WatchlistItem
import com.smartwallet.watchlist.repository.AlertRepository
import com.smartwallet.watchlist.repository.WatchlistItemRepository
import com.smartwallet.watchlist.repository.WatchlistRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class WatchlistService(
    private val watchlistRepo: WatchlistRepository,
    private val itemRepo: WatchlistItemRepository,
    private val alertRepo: AlertRepository,
    private val currentUser: CurrentUser
) {

    private fun userId(): Long = currentUser.id()

    @Transactional(readOnly = true)
    fun favorites(): List<WatchlistItem> {
        val list = defaultWatchlist()
        return itemRepo.findAllByWatchlist(list)
    }

    @Transactional
    fun addFavorite(symbol: String) {
        val list = defaultWatchlist()
        itemRepo.findByWatchlistAndAssetSymbol(list, symbol) ?: itemRepo.save(
            WatchlistItem(
                watchlist = list,
                assetSymbol = symbol
            )
        )
    }

    @Transactional
    fun removeFavorite(symbol: String) {
        val list = defaultWatchlist()
        itemRepo.findByWatchlistAndAssetSymbol(list, symbol)?.let { itemRepo.delete(it) }
    }

    @Transactional(readOnly = true)
    fun watchlists(): List<Watchlist> = watchlistRepo.findAllByUserId(userId())

    @Transactional
    fun createWatchlist(name: String): Watchlist =
        watchlistRepo.save(Watchlist(userId = userId(), name = name))

    @Transactional(readOnly = true)
    fun items(watchlistId: Long): List<WatchlistItem> =
        itemRepo.findAllByWatchlist(findWatchlist(watchlistId))

    @Transactional
    fun addItem(watchlistId: Long, symbol: String) =
        itemRepo.save(WatchlistItem(watchlist = findWatchlist(watchlistId), assetSymbol = symbol))

    @Transactional
    fun removeItem(watchlistId: Long, symbol: String) {
        val watchlist = findWatchlist(watchlistId)
        itemRepo.findByWatchlistAndAssetSymbol(watchlist, symbol)?.let { itemRepo.delete(it) }
    }

    @Transactional(readOnly = true)
    fun alerts(): List<Alert> = alertRepo.findAllByUserId(userId())

    @Transactional
    fun createAlert(symbol: String, type: String, target: BigDecimal?): Alert =
        alertRepo.save(Alert(userId = userId(), assetSymbol = symbol, alertType = type, targetValue = target))

    @Transactional
    fun deleteAlert(id: Long) = alertRepo.deleteById(id)

    private fun defaultWatchlist(): Watchlist =
        watchlistRepo.findAllByUserId(userId()).firstOrNull { it.isDefault }
            ?: watchlistRepo.save(Watchlist(userId = userId(), name = "Favoritos", isDefault = true))

    private fun findWatchlist(id: Long): Watchlist =
        watchlistRepo.findById(id).orElseThrow { NotFoundException("Watchlist not found") }
}
