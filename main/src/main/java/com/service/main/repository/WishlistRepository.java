package com.service.main.repository;

import com.service.main.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("SELECT w FROM Wishlist w WHERE w.userId = :userId AND w.productId = :productId")
    Optional<Wishlist> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT w FROM Wishlist w WHERE w.userId = :userId")
    Page<Wishlist> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT w FROM Wishlist w WHERE w.userId = :userId ORDER BY w.createdAt DESC")
    List<Wishlist> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT w FROM Wishlist w WHERE w.productId = :productId")
    Page<Wishlist> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Wishlist w WHERE w.userId = :userId AND w.productId = :productId")
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}

