package com.service.main.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class BlackListResponse {
    private Long id;
    private Long productId;
    private UserInfo bidder;
    private OffsetDateTime createdAt;
    private Long createdBy;
}

