package com.service.user.exception;


public class ApplicationException extends RuntimeException {
    
    public ApplicationException(String message) {
        super(message);
    }
    
    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    // Common error messages as constants for consistency
    public static final String INVALID_PASSWORD = "Invalid password";
    public static final String DUPLICATE_KEY = "Duplicate key";
    public static final String RESOURCE_NOT_FOUND = "Resource not found";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String INVALID_TOKEN = "Invalid token generated";
    public static final String TOKEN_EXPIRED = "Refresh token is expired";
    public static final String UNAUTHORIZED = "Unauthorized, refresh token is missing";
}

