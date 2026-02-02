package com.service.main.dto;

import com.service.common.dto.UserInfo;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class BidRequestResponse {
    private Long id;
    private Long productId;
    private UserInfo bidder;
    private Long sellerId;
    private Boolean verified;
    private OffsetDateTime createdAt;
}

