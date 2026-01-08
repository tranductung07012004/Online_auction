package com.service.main.repository;

import com.service.main.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Lấy tất cả messages của một order (chat room), sắp xếp theo thời gian
    List<ChatMessage> findByOrderIdOrderByCreatedAtAsc(Long orderId);
    
    // Đếm số messages trong một order
    Long countByOrderId(Long orderId);
}
