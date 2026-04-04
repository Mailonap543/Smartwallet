package com.smartwallet.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
    int status,
    String error,
    String message,
    String path,
    LocalDateTime timestamp,
    List<FieldError> errors
) {
    public record FieldError(String field, String message) {}

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), null);
    }

    public static ErrorResponse of(int status, String error, String message, String path, List<FieldError> errors) {
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), errors);
    }
}