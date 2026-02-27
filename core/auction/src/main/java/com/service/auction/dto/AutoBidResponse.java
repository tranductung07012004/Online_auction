package com.service.auction.dto;

import com.service.common.dto.UserInfo;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AutoBidResponse {
    private Long id;
    private Long productId;
    private UserInfo bidder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
