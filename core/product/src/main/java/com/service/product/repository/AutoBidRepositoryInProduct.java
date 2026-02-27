package com.service.product.repository;

import com.service.product.entity.AutoBidInProduct;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AutoBidRepositoryInProduct extends JpaRepository<AutoBidInProduct, Long> {
    @Query("SELECT a FROM AutoBidInProduct a WHERE a.bidderId = :bidderId")
    List<AutoBidInProduct> findByBidderId(@Param("bidderId") Long bidderId);

    @Query("SELECT a FROM AutoBidInProduct a WHERE a.productId = :productId AND a.bidderId != :excludeBidderId ORDER BY a.maxPrice DESC, a.createdAt ASC")
    List<AutoBidInProduct> findByProductIdExcludingBidderOrderByMaxPriceDesc(@Param("productId") Long productId, @Param("excludeBidderId") Long excludeBidderId);

    @Query("SELECT a FROM AutoBidInProduct a WHERE a.productId = :productId")
    List<AutoBidInProduct> findByProductIdReturnList(@Param("productId") Long productId);

}
