package com.service.admin.repository;

import com.service.admin.entity.ProductInAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepositoryInAdmin extends JpaRepository<ProductInAdmin, Long> {

    // Dung entityGraph vi chung ta da set fetchType.LAZY, nhu the nay thi no se JOIN table => 1 query thoi
    // Con neu ko dung entityGraph thi se truy van nhieu query hon (no ko dung JOIN), tuc la khi dung product.getDescriptions() thi sinh
    // ra them 1 cau query moi => tang ganh nang cho db => giam hieu suat
    @EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    Optional<ProductInAdmin> findById(Long id);

    // Dashboard queries
    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.endAt > :now")
    long countActiveAuctions(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.endAt <= :now")
    long countEndedAuctions(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.endAt > :now AND p.endAt <= :endingSoon")
    long countEndingSoonAuctions(@Param("now") OffsetDateTime now, @Param("endingSoon") OffsetDateTime endingSoon);

    @Query("SELECT COALESCE(SUM(p.bidCount), 0) FROM ProductInAdmin p")
    long sumTotalBids();

    @Query("SELECT MAX(p.currentPrice) FROM ProductInAdmin p WHERE p.endAt > :now")
    java.math.BigDecimal findHighestCurrentPrice(@Param("now") OffsetDateTime now);

    @Query("SELECT AVG(p.startPrice) FROM ProductInAdmin p")
    java.math.BigDecimal findAverageStartPrice();

    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.createdAt >= :startDate")
    long countProductsCreatedAfter(@Param("startDate") OffsetDateTime startDate);

    List<ProductInAdmin> findTop10ByOrderByCreatedAtDesc();

    // ==================== Admin Product Management Queries ====================
    
    // Search products with filters
    @Query("""
        SELECT p FROM ProductInAdmin p 
        WHERE (LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL)
        AND (:sellerId IS NULL OR p.sellerId = :sellerId)
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInAdmin> findAllWithFilters(
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Search active products only
    @Query("""
        SELECT p FROM ProductInAdmin p
        WHERE p.endAt > :now
        AND (LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL)
        AND (:sellerId IS NULL OR p.sellerId = :sellerId)
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInAdmin> findActiveWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Search ended products only
    @Query("""
        SELECT p FROM ProductInAdmin p
        WHERE p.endAt <= :now
        AND (LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL)
        AND (:sellerId IS NULL OR p.sellerId = :sellerId)
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInAdmin> findEndedWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Count products with bids
    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.bidCount > 0")
    long countProductsWithBids();

    // Count products without bids
    @Query("SELECT COUNT(p) FROM ProductInAdmin p WHERE p.bidCount = 0")
    long countProductsWithoutBids();

    // Find products by seller with pagination
    Page<ProductInAdmin> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

}


