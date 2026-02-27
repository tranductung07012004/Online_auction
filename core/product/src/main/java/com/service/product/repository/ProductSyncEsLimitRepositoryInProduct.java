package com.service.product.repository;

import com.service.product.entity.ProductSyncEsLimitInProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductSyncEsLimitRepositoryInProduct extends JpaRepository<ProductSyncEsLimitInProduct, Long> {
    @Query("SELECT p from ProductSyncEsLimitInProduct p where p.productId = :productId")
    Optional<ProductSyncEsLimitInProduct> findByProductId(@Param("productId") Long productId);
}
