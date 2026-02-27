package com.service.auction.repository;

import com.service.auction.entity.AutoBidInAuction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AutoBidRepositoryInAuction extends JpaRepository<AutoBidInAuction, Long> {

    @Query("SELECT a FROM AutoBidInAuction a WHERE a.productId = :productId AND a.bidderId = :bidderId")
    Optional<AutoBidInAuction> findByProductIdAndBidderId(@Param("productId") Long productId, @Param("bidderId") Long bidderId);

    @Query("SELECT a FROM AutoBidInAuction a WHERE a.productId = :productId")
    Page<AutoBidInAuction> findByProductId(@Param("productId") Long productId, Pageable pageable);


    @Query("SELECT a FROM AutoBidInAuction a WHERE a.productId = :productId AND a.bidderId NOT IN :excludedBidderIds")
    Page<AutoBidInAuction> findByProductIdExcludingBidderIds(@Param("productId") Long productId, @Param("excludedBidderIds") List<Long> excludedBidderIds, Pageable pageable);
}

