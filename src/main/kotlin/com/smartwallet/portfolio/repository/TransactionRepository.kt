package com.smartwallet.portfolio.repository

import com.smartwallet.portfolio.model.Transaction
import com.smartwallet.portfolio.model.PortfolioAsset
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TransactionRepository : JpaRepository<Transaction, Long> {
    fun findAllByAsset(asset: PortfolioAsset): List<Transaction>
}
