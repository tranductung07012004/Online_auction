package com.service.main.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for admin to cancel/end a product auction early
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCancelProductRequest {
    @NotBlank(message = "Reason is required")
    private String reason;
}
