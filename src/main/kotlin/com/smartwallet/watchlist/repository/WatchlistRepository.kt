package com.smartwallet.watchlist.repository

import com.smartwallet.watchlist.model.Watchlist
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WatchlistRepository : JpaRepository<Watchlist, Long> {
    fun findAllByUserId(userId: Long): List<Watchlist>
}
