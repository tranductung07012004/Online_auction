package com.service.main.repository;

import com.service.main.entity.ProductSyncEsLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductSyncEsLimitRepository extends JpaRepository<ProductSyncEsLimit, Long> {
    @Query("SELECT p from ProductSyncEsLimit p where p.productId = :productId")
    Optional<ProductSyncEsLimit> findByProductId(@Param("productId") Long productId);
}
