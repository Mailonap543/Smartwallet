package com.smartwallet.market.repository

import com.smartwallet.market.model.AssetCategory
import com.smartwallet.market.model.MarketAsset
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MarketAssetRepository : JpaRepository<MarketAsset, Long> {
    fun findBySymbolIgnoreCase(symbol: String): MarketAsset?
    fun findByCategoryAndIsActiveTrue(category: AssetCategory, pageable: Pageable): Page<MarketAsset>
    fun findBySymbolContainingIgnoreCaseOrNameContainingIgnoreCase(
        symbol: String,
        name: String,
        pageable: Pageable
    ): Page<MarketAsset>

    fun findTop20ByIsFeaturedTrueOrderByUpdatedAtDesc(): List<MarketAsset>
    fun findTop20ByDayVolumeNotNullOrderByDayVolumeDesc(): List<MarketAsset>
    fun findAllByIsActiveTrue(pageable: Pageable): Page<MarketAsset>
}
