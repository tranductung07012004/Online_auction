package com.service.main.repository;

import com.service.main.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.buyerId = :userId")
    Page<Order> findAllByBuyerId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.sellerId = :userId")
    Page<Order> findAllBySellerId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Check if an order already exists for a product
     */
    boolean existsByProductId(Long productId);
}
