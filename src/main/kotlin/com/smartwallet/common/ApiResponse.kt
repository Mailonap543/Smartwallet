package com.smartwallet.common

import java.time.Instant

data class ApiResponse<T>(
    val success: Boolean = true,
    val message: String? = null,
    val data: T? = null,
    val timestamp: Instant = Instant.now()
)
