package com.service.main.repository;

import com.service.main.entity.OrderReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReviewRepository extends JpaRepository<OrderReview, Long> {
    List<OrderReview> findByOrderId(Long orderId);
    boolean existsByOrderIdAndUserId(Long orderId, Long userId);
}
