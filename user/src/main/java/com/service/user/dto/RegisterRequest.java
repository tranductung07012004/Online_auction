package com.service.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "fullname is required")
    private String fullname;

    @NotBlank(message = "addredd is required")
    private String address;

    @NotBlank(message = "reCAPTCHA token is required")
    private String recaptchaToken;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "BIDDER|ADMIN", message = "Invalid role, role must be BIDDER|ADMIN")
    private String role;
}
