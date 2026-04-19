package com.smartwallet.market.repository

import com.smartwallet.market.model.EarningsEvent
import com.smartwallet.market.model.MarketAsset
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EarningsEventRepository : JpaRepository<EarningsEvent, Long> {
    fun findTop20ByAssetOrderByEventDateDesc(asset: MarketAsset): List<EarningsEvent>
}
