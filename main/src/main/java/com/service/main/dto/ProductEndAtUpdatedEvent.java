package com.service.main.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ProductEndAtUpdatedEvent {
    private Long productId;
    private OffsetDateTime newEndAt;
}




















