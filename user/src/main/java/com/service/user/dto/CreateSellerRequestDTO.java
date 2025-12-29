package com.service.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSellerRequestDTO {
    
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 1000, message = "Reason must be between 10 and 1000 characters")
    private String reason;
    
    @Size(max = 500, message = "Business name must not exceed 500 characters")
    private String businessName;
    
    @Size(max = 500, message = "Business address must not exceed 500 characters")
    private String businessAddress;
    
    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phoneNumber;
}
