package com.service.auction.repository;

import com.service.auction.entity.BlackListInAuction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BlackListRepositoryInAuction extends JpaRepository<BlackListInAuction, Long> {
    boolean existsByBidderIdAndProductId(Long bidderId, Long productId);

    @Query("SELECT b FROM BlackListInAuction b WHERE b.productId = :productId")
    Page<BlackListInAuction> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT b FROM BlackListInAuction b WHERE b.productId = :productId")
    List<BlackListInAuction> findByProductIdReturnList(@Param("productId") Long productId);
}
