package com.smartwallet.config.exceptionhandler;

import com.smartwallet.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        HttpStatus status;
        switch (ex.getErrorCode()) {
            case "INVALID_CREDENTIALS":
                status = HttpStatus.UNAUTHORIZED;
                break;
            case "TOKEN_NOT_FOUND":
            case "TOKEN_EXPIRED":
            case "INVALID_REFRESH_TOKEN":
            case "INVALID_TOKEN":
                status = HttpStatus.UNAUTHORIZED;
                break;
            case "ACCESS_DENIED":
                status = HttpStatus.FORBIDDEN;
                break;
            default:
                status = HttpStatus.BAD_REQUEST;
        }
        ErrorResponse error = new ErrorResponse(
            false,
            ex.getMessage(),
            null,
            status.value()
        );
        return new ResponseEntity<>(error, status);
    }

    static class ErrorResponse {
        private final boolean success;
        private final String message;
        private final Object data;
        private final int statusCode;

        public ErrorResponse(boolean success, String message, Object data, int statusCode) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.statusCode = statusCode;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Object getData() { return data; }
        public int getStatusCode() { return statusCode; }
    }
}