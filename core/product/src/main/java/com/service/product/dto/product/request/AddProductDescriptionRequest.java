package com.service.product.dto.product.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddProductDescriptionRequest {
    @NotBlank(message = "Description content is required")
    private String descriptionContent;
}

