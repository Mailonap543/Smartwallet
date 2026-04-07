package com.smartwallet.portfolio.repository

import com.smartwallet.portfolio.model.Wallet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WalletRepository : JpaRepository<Wallet, Long> {
    fun findAllByUserId(userId: Long): List<Wallet>
}
