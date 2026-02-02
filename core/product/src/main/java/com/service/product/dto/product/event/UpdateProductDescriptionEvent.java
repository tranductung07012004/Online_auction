package com.service.product.dto.product.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductDescriptionEvent {
    private Long productId;
    private String productName;
    private String content;
    private OffsetDateTime createdAt;
    private String topBidderEmail;
}
