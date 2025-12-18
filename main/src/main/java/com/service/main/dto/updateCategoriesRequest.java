package com.service.main.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class updateCategoriesRequest {
    private String name;

    @Min(value = 1, message = "parent_id must be more than 0")
    private Integer parent_id;
}


