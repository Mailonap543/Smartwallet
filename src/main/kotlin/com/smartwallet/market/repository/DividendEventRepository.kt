package com.smartwallet.market.repository

import com.smartwallet.market.model.DividendEvent
import com.smartwallet.market.model.MarketAsset
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DividendEventRepository : JpaRepository<DividendEvent, Long> {
    fun findTop50ByAssetOrderByEventDateDesc(asset: MarketAsset): List<DividendEvent>
}
