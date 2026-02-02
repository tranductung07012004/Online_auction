package com.service.main.service;
import java.time.OffsetDateTime;

public interface ProductSyncEsLimitService {
    void updateLastCurPriceChangeAt(Long productId, OffsetDateTime now);
}
