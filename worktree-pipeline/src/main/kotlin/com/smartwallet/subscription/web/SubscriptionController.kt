package com.smartwallet.subscription.web

import com.smartwallet.common.ApiResponse
import com.smartwallet.subscription.service.SubscriptionService
import com.smartwallet.subscription.service.SubscriptionStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/subscription", "/api/v1/subscription"])
class SubscriptionController(
    private val subscriptionService: SubscriptionService
) {
    @GetMapping
    fun status(): ApiResponse<SubscriptionStatus> = ApiResponse(data = subscriptionService.status())
}
