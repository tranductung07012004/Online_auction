package com.service.user.exception;

import com.service.user.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .status(400)
                .body(new ApiResponse<>("Validation failed", errors));
    }

    /**
     * Handles all application-specific exceptions.
     * This provides a centralized way to handle all custom exceptions consistently.
     */
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<?> handleApplicationException(ApplicationException ex) {
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("errorCode", ex.getErrorCode());

        return ResponseEntity
                .status(400)
                .body(new ApiResponse<>(ex.getMessage(), errorData));
    }

    /**
     * Fallback handler for any other RuntimeException not caught by specific
     * handlers.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(500)
                .body(new ApiResponse<>("Internal server error: " + ex.getMessage(), null));
    }

}
