package com.service.worker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreatedEvent {
    private Long id;
    private String product_name;
    private BigDecimal current_price;
    private OffsetDateTime endAt;
    private List<Integer> categoryIds;
}








