package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.entity.ProductSyncEsLimit;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.ProductSyncEsLimitRepository;
import com.service.main.service.ProductSyncEsLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ProductSyncEsLimitServiceImpl implements ProductSyncEsLimitService {

    private final ProductSyncEsLimitRepository productSyncEsLimitRepository;

    @Override
    public void updateLastCurPriceChangeAt(Long productId, OffsetDateTime now) {
        ProductSyncEsLimit productLimit = productSyncEsLimitRepository
                .findByProductId(productId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.RESOURCE_NOT_FOUND,
                        "Cannot find product sync elastic search limit with product id: " + productId
                ));
        productLimit.setLastCurPriceChangeAt(now);
        this.productSyncEsLimitRepository.save(productLimit);
    }
}
