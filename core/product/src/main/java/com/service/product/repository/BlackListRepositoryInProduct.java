package com.service.product.repository;

import com.service.product.entity.BlackListInProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BlackListRepositoryInProduct extends JpaRepository<BlackListInProduct, Long> {
    boolean existsByBidderIdAndProductId(Long bidderId, Long productId);

    @Query("SELECT b FROM BlackListInProduct b WHERE b.productId = :productId")
    Page<BlackListInProduct> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT b FROM BlackListInProduct b WHERE b.productId = :productId")
    List<BlackListInProduct> findByProductIdReturnList(@Param("productId") Long productId);
}
