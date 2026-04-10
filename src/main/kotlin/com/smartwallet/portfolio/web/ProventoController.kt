package com.smartwallet.portfolio.web

import com.smartwallet.common.ApiResponse
import com.smartwallet.portfolio.service.ProventoResumo
import com.smartwallet.portfolio.service.ProventoService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/proventos", "/api/v1/proventos"])
class ProventoController(
    private val proventoService: ProventoService
) {
    @GetMapping("/{symbol}")
    fun resumo(@PathVariable symbol: String): ApiResponse<ProventoResumo> =
        ApiResponse(data = proventoService.resumoPorAtivo(symbol))
}
