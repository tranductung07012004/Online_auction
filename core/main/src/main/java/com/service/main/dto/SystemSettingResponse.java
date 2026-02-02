package com.service.main.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class SystemSettingResponse {
    private Long id;
    private String key;
    private JsonNode value; // JSON string
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long updatedBy;
}
