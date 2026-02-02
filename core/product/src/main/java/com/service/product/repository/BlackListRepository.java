package com.service.product.repository;

import com.service.product.entity.BlackList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BlackListRepository extends JpaRepository<BlackList, Long> {
    boolean existsByBidderIdAndProductId(Long bidderId, Long productId);

    @Query("SELECT b FROM BlackList b WHERE b.productId = :productId")
    Page<BlackList> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT b FROM BlackList b WHERE b.productId = :productId")
    List<BlackList> findByProductIdReturnList(@Param("productId") Long productId);
}
