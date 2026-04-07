package com.smartwallet.watchlist.repository

import com.smartwallet.watchlist.model.Alert
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AlertRepository : JpaRepository<Alert, Long> {
    fun findAllByUserId(userId: Long): List<Alert>
}
