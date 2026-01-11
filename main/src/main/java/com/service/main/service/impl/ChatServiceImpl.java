package com.service.main.service.impl;

import com.service.main.dto.ChatConversationDTO;
import com.service.main.dto.UserInfo;
import com.service.main.entity.ChatMessage;
import com.service.main.entity.Order;
import com.service.main.entity.Product;
import com.service.main.repository.ChatMessageRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.ChatService;
import com.service.main.service.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
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
    
    @Override
    public List<ChatConversationDTO> getAllConversations(Long userId) {
        // Lấy tất cả orders mà user là buyer hoặc seller
        List<Order> orders = orderRepository.findByBuyerIdOrSellerId(userId, userId);
        
        if (orders == null || orders.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Map orders to conversations
        return orders.stream().map(order -> {
            ChatConversationDTO dto = new ChatConversationDTO();
            dto.setOrderId(order.getId());
            dto.setOrderStatus(order.getStatus());
            
            // Get product info
            Product product = productRepository.findById(order.getProductId()).orElse(null);
            if (product != null) {
                dto.setProductName(product.getProductName());
                dto.setProductThumbnail(product.getThumbnailUrl());
            } else {
                dto.setProductName("Unknown Product");
                dto.setProductThumbnail("");
            }
            
            // Determine other user (if current user is buyer, other is seller and vice versa)
            boolean isBuyer = userId.equals(order.getBuyerId());
            Long otherUserId = isBuyer ? order.getSellerId() : order.getBuyerId();
            dto.setOtherUserId(otherUserId);
            
            // Get other user's name from user service
            try {
                UserInfo otherUserInfo = userServiceClient.getUserInfoById(otherUserId);
                if (otherUserInfo != null && otherUserInfo.getFullname() != null) {
                    dto.setOtherUserName(otherUserInfo.getFullname());
                } else {
                    dto.setOtherUserName(isBuyer ? "Người bán" : "Người mua");
                }
            } catch (Exception e) {
                // Fallback to default name if service call fails
                dto.setOtherUserName(isBuyer ? "Người bán" : "Người mua");
            }
            
            return dto;
        })
        .collect(Collectors.toList());
    }
    
    @Override
    public List<ChatMessage> getAllUserMessages(Long userId) {
        // Lấy tất cả orders mà user tham gia (buyer hoặc seller)
        List<Order> orders = orderRepository.findByBuyerIdOrSellerId(userId, userId);
        
        if (orders == null || orders.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Lấy tất cả orderIds
        List<Long> orderIds = orders.stream()
                .map(Order::getId)
                .collect(Collectors.toList());
        
        // Lấy tất cả messages từ các orders này
        List<ChatMessage> allMessages = new ArrayList<>();
        for (Long orderId : orderIds) {
            List<ChatMessage> messages = chatMessageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
            if (messages != null) {
                allMessages.addAll(messages);
            }
        }
        
        // Sort by created date (newest first)
        allMessages.sort((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()));
        
        return allMessages;
    }
}
