package com.service.main.repository;

import com.service.main.entity.BidRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BidRequestRepository extends JpaRepository<BidRequest, Long> {
    @Query("SELECT br FROM BidRequest br " +
            "WHERE br.productId = :productId AND br.bidderId = :bidderId")
    Optional<BidRequest> findByProductIdAndBidderId(
            @Param("productId") Long productId,
            @Param("bidderId") Long bidderId);

    @Query("SELECT br FROM BidRequest br WHERE br.productId = :productId")
    Page<BidRequest> findByProductId(@Param("productId") Long productId, Pageable pageable);
}
