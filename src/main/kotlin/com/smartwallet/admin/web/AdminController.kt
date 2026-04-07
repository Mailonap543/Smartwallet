package com.smartwallet.admin.web

import com.smartwallet.common.ApiResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class AdminSummary(
    val users: Long,
    val assets: Long,
    val wallets: Long,
    val alerts: Long
)

@RestController
@RequestMapping(value = ["/api/admin", "/api/v1/admin"])
class AdminController {
    @GetMapping("/summary")
    fun summary(): ApiResponse<AdminSummary> =
        ApiResponse(data = AdminSummary(users = 0, assets = 0, wallets = 0, alerts = 0))
}
