package com.service.main.service.impl;

import com.service.main.entity.ChatMessage;
import com.service.main.entity.Order;
import com.service.main.repository.ChatMessageRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Override
@Transactional
public ChatMessage sendMessage(Long orderId, Long senderId, String message) {
    if (orderId == null) throw new RuntimeException("orderId is required");
    if (senderId == null) throw new RuntimeException("senderId is required");
    if (message == null || message.trim().isEmpty()) throw new RuntimeException("message is empty");

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    if (!senderId.equals(order.getBuyerId()) && !senderId.equals(order.getSellerId())) {
        throw new RuntimeException("You are not authorized to send messages in this chat");
    }

    ChatMessage chatMessage = new ChatMessage();
    chatMessage.setOrderId(orderId);
    chatMessage.setSenderId(senderId);
    chatMessage.setMessage(message.trim());

    return chatMessageRepository.save(chatMessage);
}

    
    @Override
    public List<ChatMessage> getChatHistory(Long orderId) {
        // Validate order exists
        orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        return chatMessageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }
    
    @Override
    public boolean canAccessChat(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false;
        }
        // User có thể access nếu là buyer hoặc seller của order
        return userId.equals(order.getBuyerId()) || userId.equals(order.getSellerId());
    }
}
