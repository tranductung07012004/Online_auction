package com.service.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAvatarRequest {
    @NotBlank(message = "Avatar is required")
    private String avatar;
}

