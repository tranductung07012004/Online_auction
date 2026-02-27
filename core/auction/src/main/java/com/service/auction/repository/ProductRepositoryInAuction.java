package com.service.auction.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import com.service.auction.entity.ProductInAuction;

public interface ProductRepositoryInAuction extends JpaRepository<ProductInAuction, Long> {

    // Dung entityGraph vi chung ta da set fetchType.LAZY, nhu the nay thi no se JOIN table => 1 query thoi
    // Con neu ko dung entityGraph thi se truy van nhieu query hon (no ko dung JOIN), tuc la khi dung ProductInAuction.getDescriptions() thi sinh
    // ra them 1 cau query moi => tang ganh nang cho db => giam hieu suat
    @EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    Optional<ProductInAuction> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    //@EntityGraph(attributePaths = {"descriptions", "pictures", "ProductInAuctionCategories.category"})
    @Query("SELECT p FROM ProductInAuction p WHERE p.id = :id")
    Optional<ProductInAuction> findByIdWithLock(@Param("id") Long id);

}


