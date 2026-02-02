package com.service.product.dto.wishlist.response;

import com.service.common.dto.UserInfo;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class WishlistResponse {
    private Long id;
    private Long productId;
    private UserInfo user;
    private OffsetDateTime createdAt;
}



