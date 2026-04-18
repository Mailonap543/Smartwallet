package com.smartwallet.common

import com.smartwallet.exception.BusinessException
import com.smartwallet.exception.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import jakarta.servlet.http.HttpServletRequest

@RestControllerAdvice
class GlobalExceptionHandler {

    companion object {
        private const val INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas"
        private const val AUTHENTICATION_ERROR_MESSAGE = "Erro de autenticação"
        private const val INTERNAL_ERROR_MESSAGE = "Erro interno do servidor"
    }

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse(success = false, message = ex.message))
    }

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(ex: ResourceNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse(success = false, message = ex.message))
    }

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(ex: BusinessException): ResponseEntity<ApiResponse<Nothing>> {
        log.warn("Business error: {} - {}", ex.errorCode, ex.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse(success = false, message = ex.message))
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<ApiResponse<Nothing>> {
        log.debug("Bad credentials: {}", ex.message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse(success = false, message = INVALID_CREDENTIALS_MESSAGE))
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ApiResponse<Nothing>> {
        log.debug("Authentication exception: {}", ex.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse(success = false, message = INVALID_CREDENTIALS_MESSAGE))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>> {
        val msg = ex.bindingResult.fieldErrors.joinToString("; ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse(success = false, message = msg.ifBlank { "Validation error" }))
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception): ResponseEntity<ApiResponse<Nothing>> {
        log.error("Unhandled exception: {} - {}", ex.javaClass.simpleName, ex.message, ex)
        
        val message = when {
            ex.message?.contains("Credenciais", ignoreCase = true) == true -> INVALID_CREDENTIALS_MESSAGE
            ex.message?.contains("Bad credentials", ignoreCase = true) == true -> INVALID_CREDENTIALS_MESSAGE
            ex.message?.contains("Invalid", ignoreCase = true) == true -> INVALID_CREDENTIALS_MESSAGE
            ex.message?.contains("JWT", ignoreCase = true) == true -> AUTHENTICATION_ERROR_MESSAGE
            else -> INTERNAL_ERROR_MESSAGE
        }
        
        val status = if (message == INVALID_CREDENTIALS_MESSAGE || message == AUTHENTICATION_ERROR_MESSAGE) HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
        
        return ResponseEntity.status(status)
            .body(ApiResponse(success = false, message = message))
    }
}
