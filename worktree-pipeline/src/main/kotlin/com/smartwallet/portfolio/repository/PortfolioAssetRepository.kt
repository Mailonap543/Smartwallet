package com.smartwallet.portfolio.repository

import com.smartwallet.portfolio.model.PortfolioAsset
import com.smartwallet.portfolio.model.Wallet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PortfolioAssetRepository : JpaRepository<PortfolioAsset, Long> {
    fun findAllByWallet(wallet: Wallet): List<PortfolioAsset>
}
