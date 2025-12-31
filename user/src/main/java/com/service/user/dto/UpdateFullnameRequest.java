package com.service.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFullnameRequest {
    @NotBlank(message = "Fullname is required")
    private String fullname;

    @NotBlank(message = "Password is required")
    private String password;
}

