package com.service.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class verifyOtpRequest {

    @NotNull(message = "userId is required in body")
    @Min(value = 1, message = "userId must be greater than 0")
    private Long userId;

    @NotBlank(message = "otp is required in body")
    @Size(min = 6, max = 6, message = "otp must be exactly 6 characters long")
    private String otp;

    @NotBlank(message = "email is required in body")
    @Email(message = "email format is wrong please check")
    private String email;
}
