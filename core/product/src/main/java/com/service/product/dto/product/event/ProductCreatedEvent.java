package com.service.product.dto.product.event;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class ProductCreatedEvent {
    private Long id;
    private String product_name;
    private BigDecimal current_price;
    private OffsetDateTime endAt;
    private List<Integer> categoryIds;
}