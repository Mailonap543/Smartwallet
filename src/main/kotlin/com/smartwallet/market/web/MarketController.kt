package com.smartwallet.market.web

import com.smartwallet.common.ApiResponse
import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.service.MarketService
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/market", "/api/v1/market"])
class MarketController(
    private val marketService: MarketService
) {

    @GetMapping("/assets/{symbol}")
    fun getAsset(@PathVariable symbol: String): ApiResponse<MarketAsset> =
        ApiResponse(data = marketService.getAsset(symbol))

    @GetMapping("/search")
    fun search(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<Page<MarketAsset>> =
        ApiResponse(data = marketService.search(q, category, page, size))

    @GetMapping("/categories")
    fun categories() = ApiResponse(data = marketService.categories())

    @GetMapping("/featured")
    fun featured() = ApiResponse(data = marketService.featured())

    @GetMapping("/trending")
    fun trending() = ApiResponse(data = marketService.trending())

    @GetMapping("/rankings/{type}")
    fun rankings(
        @PathVariable type: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ) = ApiResponse(data = marketService.rankings(type, page, size))

    @GetMapping("/rankings")
    fun rankingsDefault(
        @RequestParam(defaultValue = "dividendyield") type: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ) = rankings(type, page, size)

    @GetMapping("/quote/{symbol}")
    fun quote(@PathVariable symbol: String) = ApiResponse(data = marketService.quote(symbol))

    @PostMapping("/quotes")
    fun quotes(@RequestBody symbols: List<String>) = ApiResponse(data = marketService.quotes(symbols))

    @GetMapping("/dividends/{symbol}")
    fun dividends(@PathVariable symbol: String) = ApiResponse(data = marketService.dividendHistory(symbol))

    @GetMapping("/earnings/{symbol}")
    fun earnings(@PathVariable symbol: String) = ApiResponse(data = marketService.earningsHistory(symbol))

    @GetMapping("/history/{symbol}")
    fun history(@PathVariable symbol: String) = ApiResponse(data = marketService.priceHistory(symbol))
}
