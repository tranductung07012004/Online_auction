package com.service.user.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSellerRequestDTO {
    
    @NotNull(message = "Approved status is required")
    private Boolean approved;
    
    @Size(max = 1000, message = "Admin note must not exceed 1000 characters")
    private String adminNote;
}
