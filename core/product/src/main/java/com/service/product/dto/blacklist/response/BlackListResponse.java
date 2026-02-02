package com.service.product.dto.blacklist.response;

import com.service.common.dto.UserInfo;
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

