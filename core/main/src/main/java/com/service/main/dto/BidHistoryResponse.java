package com.service.main.dto;

import com.service.common.dto.UserInfo;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class BidHistoryResponse {
    private Long id;
    private Long productId;
    private UserInfo bidder;
    private BigDecimal price;
    private OffsetDateTime createdAt;
}


