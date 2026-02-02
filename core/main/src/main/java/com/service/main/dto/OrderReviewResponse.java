package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReviewResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private String userFullName;
    private Integer status; // +1 or -1
    private String comment;
    private OffsetDateTime createdAt;
}
