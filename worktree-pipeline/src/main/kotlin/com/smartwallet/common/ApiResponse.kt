package com.smartwallet.common

import java.time.Instant

data class ApiResponse<T>(
    val success: Boolean = true,
    val message: String? = null,
    val data: T? = null,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> builder(): ApiResponseBuilder<T> = ApiResponseBuilder()
    }
}

class ApiResponseBuilder<T> {
    private var success: Boolean = true
    private var message: String? = null
    private var data: T? = null

    fun success(success: Boolean) = apply { this.success = success }
    fun message(message: String?) = apply { this.message = message }
    fun data(data: T?) = apply { this.data = data }
    fun build() = ApiResponse(success, message, data, Instant.now())
}
