package com.service.main.service;

import com.service.main.dto.ChatConversationDTO;
import com.service.main.entity.ChatMessage;
import java.util.List;

public interface ChatService {
    
    // Lưu tin nhắn mới
    ChatMessage sendMessage(Long orderId, Long senderId, String message);
    
    // Lấy lịch sử chat của một order
    List<ChatMessage> getChatHistory(Long orderId);
    
    // Kiểm tra user có quyền truy cập chat của order không
    boolean canAccessChat(Long orderId, Long userId);
    
    // Lấy tất cả conversations của user
    List<ChatConversationDTO> getAllConversations(Long userId);
    
    // Lấy tất cả chat messages của user (từ tất cả các orders)
    List<ChatMessage> getAllUserMessages(Long userId);
}
