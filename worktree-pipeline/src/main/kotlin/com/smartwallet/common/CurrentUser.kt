package com.smartwallet.common

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class CurrentUser {
    fun id(): Long {
        val auth = SecurityContextHolder.getContext().authentication
        val name = auth?.name
        return name?.toLongOrNull() ?: 0L
    }
}
