package com.service.main.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateQuestionRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Content is required")
    private String content;
}
