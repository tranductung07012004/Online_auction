package com.service.main.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class WishlistResponse {
    private Long id;
    private Long productId;
    private UserInfo user;
    private OffsetDateTime createdAt;
}



