package com.service.main.repository;

import com.service.main.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Dung entityGraph vi chung ta da set fetchType.LAZY, nhu the nay thi no se JOIN table => 1 query thoi
    // Con neu ko dung entityGraph thi se truy van nhieu query hon (no ko dung JOIN), tuc la khi dung product.getDescriptions() thi sinh
    // ra them 1 cau query moi => tang ganh nang cho db => giam hieu suat
    @EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    Optional<Product> findById(Long id);

    // KO dung duoc vi jpa bao loi:
    // "message": "Internal server error: org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: [com.service.main.entity.Product.descriptions, com.service.main.entity.Product.pictures]",
    //@EntityGraph(attributePaths = {"descriptions", "pictures", "productCategories.category"})
    @Query("""
            SELECT p FROM Product p
            WHERE p.endAt > :now
            ORDER BY p.endAt ASC
            """)
    List<Product> findTopEndingSoon(@Param("now") OffsetDateTime now);

    @Query("""
        SELECT p FROM Product p
        WHERE p.endAt > :now
        ORDER BY p.bidCount DESC
    """)
    List<Product> findTop5MostBidded(@Param("now") OffsetDateTime now);

    @Query("""
            SELECT p FROM Product p
            WHERE p.endAt > :now
              AND p.currentPrice IS NOT NULL
            ORDER BY p.currentPrice DESC
            """)
    List<Product> findTop5HighestCurrentPrice(@Param("now") OffsetDateTime now);

    @Query("SELECT DISTINCT p FROM Product p " +
            "JOIN p.productCategories pc " +
            "WHERE pc.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);

    // Dashboard queries
    @Query("SELECT COUNT(p) FROM Product p WHERE p.endAt > :now")
    long countActiveAuctions(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.endAt <= :now")
    long countEndedAuctions(@Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.endAt > :now AND p.endAt <= :endingSoon")
    long countEndingSoonAuctions(@Param("now") OffsetDateTime now, @Param("endingSoon") OffsetDateTime endingSoon);

    @Query("SELECT COALESCE(SUM(p.bidCount), 0) FROM Product p")
    long sumTotalBids();

    @Query("SELECT MAX(p.currentPrice) FROM Product p WHERE p.endAt > :now")
    java.math.BigDecimal findHighestCurrentPrice(@Param("now") OffsetDateTime now);

    @Query("SELECT AVG(p.startPrice) FROM Product p")
    java.math.BigDecimal findAverageStartPrice();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.createdAt >= :startDate")
    long countProductsCreatedAfter(@Param("startDate") OffsetDateTime startDate);

    List<Product> findTop10ByOrderByCreatedAtDesc();

    // ==================== Admin Product Management Queries ====================
    
    // Search products with filters
    @Query(value = """
        SELECT * FROM product p 
        WHERE (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
        ORDER BY p.created_at DESC
    """, 
    countQuery = """
        SELECT COUNT(*) FROM product p 
        WHERE (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
    """,
    nativeQuery = true)
    Page<Product> findAllWithFilters(
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Search active products only
    @Query(value = """
        SELECT * FROM product p 
        WHERE p.end_at > CAST(:now AS TIMESTAMPTZ)
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
        ORDER BY p.created_at DESC
    """, 
    countQuery = """
        SELECT COUNT(*) FROM product p 
        WHERE p.end_at > CAST(:now AS TIMESTAMPTZ)
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
    """,
    nativeQuery = true)
    Page<Product> findActiveWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Search ended products only
    @Query(value = """
        SELECT * FROM product p 
        WHERE p.end_at <= CAST(:now AS TIMESTAMPTZ)
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
        ORDER BY p.created_at DESC
    """, 
    countQuery = """
        SELECT COUNT(*) FROM product p 
        WHERE p.end_at <= CAST(:now AS TIMESTAMPTZ)
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (CAST(:sellerId AS BIGINT) IS NULL OR p.seller_id = CAST(:sellerId AS BIGINT))
    """,
    nativeQuery = true)
    Page<Product> findEndedWithFilters(
        @Param("now") OffsetDateTime now,
        @Param("search") String search,
        @Param("sellerId") Long sellerId,
        Pageable pageable
    );

    // Count products with bids
    @Query("SELECT COUNT(p) FROM Product p WHERE p.bidCount > 0")
    long countProductsWithBids();

    // Count products without bids
    @Query("SELECT COUNT(p) FROM Product p WHERE p.bidCount = 0")
    long countProductsWithoutBids();

    // Find products by seller with pagination
    Page<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    // Find products by category with admin filters
    @Query(value = """
        SELECT DISTINCT p.* FROM product p 
        JOIN product_category pc ON p.id = pc.product_id
        WHERE pc.category_id = :categoryId
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        ORDER BY p.created_at DESC
    """, 
    countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM product p 
        JOIN product_category pc ON p.id = pc.product_id
        WHERE pc.category_id = :categoryId
        AND (CAST(:search AS VARCHAR) IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
    """,
    nativeQuery = true)
    Page<Product> findByCategoryWithFilters(
        @Param("categoryId") Integer categoryId,
        @Param("search") String search,
        Pageable pageable
    );
}


