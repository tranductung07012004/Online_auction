package com.service.main.repository;

import com.service.main.entity.BidHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {
    
    @Query("SELECT bh FROM BidHistory bh WHERE bh.productId = :productId ORDER BY bh.createdAt DESC")
    Page<BidHistory> findByProductId(@Param("productId") Long productId, Pageable pageable);
}