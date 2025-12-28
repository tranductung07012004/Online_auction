package com.service.main.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SystemSettingCreateRequest {

    @NotBlank(message = "Key is required")
    private String key;

    @NotNull(message = "value is required")
    private JsonNode value;

    private String description;

    // private Long updatedBy; // ID của user thực hiện (thường lấy từ SecurityContext)
}
