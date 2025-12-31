package com.service.main.repository;

import com.service.main.entity.AutoBid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AutoBidRepository extends JpaRepository<AutoBid, Long> {

    @Query("SELECT a FROM AutoBid a WHERE a.productId = :productId AND a.bidderId = :bidderId")
    Optional<AutoBid> findByProductIdAndBidderId(@Param("productId") Long productId, @Param("bidderId") Long bidderId);

    @Query("SELECT a FROM AutoBid a WHERE a.productId = :productId")
    Page<AutoBid> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT a FROM AutoBid a WHERE a.productId = :productId AND a.bidderId != :excludeBidderId ORDER BY a.maxPrice DESC, a.createdAt ASC")
    List<AutoBid> findByProductIdExcludingBidderOrderByMaxPriceDesc(@Param("productId") Long productId, @Param("excludeBidderId") Long excludeBidderId);
}
