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
            .body(ApiResponse(success = false, message = "Credenciais inválidas"))
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ApiResponse<Nothing>> {
        log.debug("Authentication exception: {}", ex.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse(success = false, message = "Credenciais inválidas"))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>> {
        val msg = ex.bindingResult.fieldErrors.joinToString("; ") { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse(success = false, message = msg.ifBlank { "Validation error" }))
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception): ResponseEntity<ApiResponse<Nothing>> {
        System.out.println("=== EXCEPTION IN CONTROLLER ===");
        System.out.println("Type: " + ex.javaClass.simpleName);
        System.out.println("Message: " + ex.message);
        ex.printStackTrace();
        
        val message = when {
            ex.message?.contains("Credenciais", ignoreCase = true) == true -> "Credenciais inválidas"
            ex.message?.contains("Bad credentials", ignoreCase = true) == true -> "Credenciais inválidas"
            ex.message?.contains("Invalid", ignoreCase = true) == true -> "Credenciais inválidas"
            ex.message?.contains("JWT", ignoreCase = true) == true -> "Erro de autenticação"
            else -> "Erro interno do servidor"
        }
        
        val status = if (message == "Credenciais inválidas" || message == "Erro de autenticação") HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
        
        return ResponseEntity.status(status)
            .body(ApiResponse(success = false, message = message))
    }
}
