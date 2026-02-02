package com.service.main.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class createCategoriesRequest {

    @NotBlank(message = "name is required")
    @NotNull(message = "name is not null")
    private String name;

    @Min(value = 1, message = "parent_id must be more than 0")
    private Integer parent_id;
}
