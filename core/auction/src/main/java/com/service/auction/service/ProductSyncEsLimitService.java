package com.service.auction.service;
import java.time.OffsetDateTime;

public interface ProductSyncEsLimitService {
    void updateLastCurPriceChangeAt(Long productId, OffsetDateTime now);
}
