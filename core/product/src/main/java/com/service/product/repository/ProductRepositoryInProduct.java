package com.service.product.repository;

import com.service.product.entity.ProductInProduct;
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

public interface ProductRepositoryInProduct extends JpaRepository<ProductInProduct, Long> {

    // Dung entityGraph vi chung ta da set fetchType.LAZY, nhu the nay thi no se JOIN table => 1 query thoi
    // Con neu ko dung entityGraph thi se truy van nhieu query hon (no ko dung JOIN), tuc la khi dung product.getDescriptions() thi sinh
    // ra them 1 cau query moi => tang ganh nang cho db => giam hieu suat
    @EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    Optional<ProductInProduct> findById(Long id);

    @Query("SELECT p FROM ProductInProduct p WHERE p.id IN :ids")
    List<ProductInProduct> findByIdIn(@Param("ids") List<Long> ids);


    // KO dung duoc vi jpa bao loi:
    // "message": "Internal server error: org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: [com.service.main.entity.Product.descriptions, com.service.main.entity.Product.pictures]",
    //@EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    @Query("""
            SELECT p FROM ProductInProduct p
            WHERE p.endAt > :now
            ORDER BY p.endAt ASC
            """)
    List<ProductInProduct> findTopEndingSoon(@Param("now") OffsetDateTime now);

    @Query("""
        SELECT p FROM ProductInProduct p
        WHERE p.endAt > :now
        ORDER BY p.bidCount DESC
    """)
    List<ProductInProduct> findTop5MostBidded(@Param("now") OffsetDateTime now);

    @Query("""
            SELECT p FROM ProductInProduct p
            WHERE p.endAt > :now
              AND p.currentPrice IS NOT NULL
            ORDER BY p.currentPrice DESC
            """)
    List<ProductInProduct> findTop5HighestCurrentPrice(@Param("now") OffsetDateTime now);

    @Query("SELECT DISTINCT p FROM ProductInProduct p " +
            "JOIN p.productCategories pc " +
            "WHERE pc.category.id = :categoryId")
    Page<ProductInProduct> findByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);

    // ==================== Admin Product Management Queries ====================

    // Search active products only
    @Query("""
        SELECT p FROM ProductInProduct p
        WHERE p.endAt > :now
        AND (LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL)
        AND (:sellerId IS NULL OR p.sellerId = :sellerId)
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInProduct> findActiveWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Search ended products only
    @Query("""
        SELECT p FROM ProductInProduct p
        WHERE p.endAt <= :now
        AND (LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR :search IS NULL)
        AND (:sellerId IS NULL OR p.sellerId = :sellerId)
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInProduct> findEndedWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Find products by seller with pagination
    Page<ProductInProduct> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    @Query("""
        SELECT p FROM ProductInProduct p
        WHERE p.id IN :productIds
        AND p.endAt > :now
        ORDER BY p.createdAt DESC
    """)
    Page<ProductInProduct> findActiveProductsByIds(
        @Param("productIds") List<Long> productIds,
        @Param("now") OffsetDateTime now,
        Pageable pageable
    );
}


