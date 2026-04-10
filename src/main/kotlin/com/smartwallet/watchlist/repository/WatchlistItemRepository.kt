package com.smartwallet.watchlist.repository

import com.smartwallet.watchlist.model.Watchlist
import com.smartwallet.watchlist.model.WatchlistItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WatchlistItemRepository : JpaRepository<WatchlistItem, Long> {
    fun findAllByWatchlist(watchlist: Watchlist): List<WatchlistItem>
    fun findByWatchlistAndAssetSymbol(watchlist: Watchlist, assetSymbol: String): WatchlistItem?
}
