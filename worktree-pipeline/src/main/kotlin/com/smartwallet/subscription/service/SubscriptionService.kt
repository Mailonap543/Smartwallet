package com.smartwallet.subscription.service

import com.smartwallet.common.CurrentUser
import org.springframework.stereotype.Service

data class SubscriptionStatus(
    val plan: String,
    val status: String,
    val expiresAt: String?
)

@Service
class SubscriptionService(
    private val currentUser: CurrentUser
) {
    fun status(): SubscriptionStatus =
        SubscriptionStatus(plan = "FREE", status = "ACTIVE", expiresAt = null)
}
