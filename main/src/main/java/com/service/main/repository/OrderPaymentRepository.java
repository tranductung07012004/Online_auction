package com.service.main.repository;

import com.service.main.entity.OrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {
    Optional<OrderPayment> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
}
