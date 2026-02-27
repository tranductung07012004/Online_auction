package com.service.auction.repository;

import com.service.auction.entity.ProductSyncEsLimitInAuction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductSyncEsLimitRepositoryInAuction extends JpaRepository<ProductSyncEsLimitInAuction, Long> {
    @Query("SELECT p from ProductSyncEsLimitInAuction p where p.productId = :productId")
    Optional<ProductSyncEsLimitInAuction> findByProductId(@Param("productId") Long productId);
}
