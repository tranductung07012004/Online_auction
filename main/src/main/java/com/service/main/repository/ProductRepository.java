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
}


