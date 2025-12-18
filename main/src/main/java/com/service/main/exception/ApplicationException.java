package com.service.main.exception;

public class ApplicationException extends RuntimeException {

    public ApplicationException(String message) {
        super(message);
    }

    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
    }

    // Common error messages for consistent usage
    public static final String DUPLICATE_KEY = "Duplicate key";
    public static final String RESOURCE_NOT_FOUND = "Resource not found";
    public static final String VALIDATION_FAILED = "Validation failed";
}

