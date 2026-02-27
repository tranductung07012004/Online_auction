package com.service.auction.service.impl;

import com.service.auction.repository.ProductSyncEsLimitRepositoryInAuction;
import com.service.common.constants.ErrorCodes;
import com.service.auction.entity.ProductSyncEsLimitInAuction;
import com.service.common.exception.ApplicationException;
import com.service.auction.service.ProductSyncEsLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ProductSyncEsLimitServiceImpl implements ProductSyncEsLimitService {

    private final ProductSyncEsLimitRepositoryInAuction productSyncEsLimitRepository;

    @Override
    public void updateLastCurPriceChangeAt(Long productId, OffsetDateTime now) {
        ProductSyncEsLimitInAuction productLimit = productSyncEsLimitRepository
                .findByProductId(productId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.RESOURCE_NOT_FOUND,
                        "Cannot find product sync elastic search limit with product id: " + productId
                ));
        productLimit.setLastCurPriceChangeAt(now);
        this.productSyncEsLimitRepository.save(productLimit);
    }
}
