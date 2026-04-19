package com.smartwallet.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    @Test
    void handleBusinessException_ShouldReturnBadRequest() {
        BusinessException ex = new BusinessException("Test error", "TEST_CODE");
        
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBusinessException(ex);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleGenericException_ShouldReturnInternalServerError() {
        Exception ex = new RuntimeException("Unexpected error");
        
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(ex);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void errorResponse_ShouldHaveCorrectFormat() {
        ErrorResponse response = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Test error",
            "TEST_CODE"
        );
        
        assertEquals(400, response.getStatus());
        assertEquals("Test error", response.getMessage());
        assertEquals("TEST_CODE", response.getCode());
    }

    @Test
    void businessException_ShouldStoreDetails() {
        BusinessException ex = new BusinessException(
            "Test error", 
            "TEST_CODE",
            Map.of("field", "value")
        );
        
        assertEquals("Test error", ex.getMessage());
        assertEquals("TEST_CODE", ex.getCode());
        assertNotNull(ex.getDetails());
    }
}