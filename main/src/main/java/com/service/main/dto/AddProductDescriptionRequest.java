package com.service.main.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddProductDescriptionRequest {
    @NotBlank(message = "Description content is required")
    private String descriptionContent;
}

