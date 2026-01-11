package com.service.main.controller;

import com.service.main.dto.ChatConversationDTO;
import com.service.main.entity.ChatMessage;
import com.service.main.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main/chat")
public class ChatRestController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * GET /api/main/chat/conversations
     * Lấy tất cả cuộc trò chuyện của user hiện tại
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationDTO>> getAllConversations() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long currentUserId = Long.valueOf(authentication.getName());
            
            List<ChatConversationDTO> conversations = chatService.getAllConversations(currentUserId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * GET /api/main/chat/messages
     * Lấy tất cả tin nhắn chat của user hiện tại (từ tất cả các orders)
     */
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getAllUserMessages() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long currentUserId = Long.valueOf(authentication.getName());
            
            List<ChatMessage> messages = chatService.getAllUserMessages(currentUserId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * GET /api/main/chat/order/{orderId}/messages
     * Lấy lịch sử chat của một order (có kiểm tra quyền truy cập)
     */
    @GetMapping("/order/{orderId}/messages")
    public ResponseEntity<?> getChatHistory(@PathVariable Long orderId) {
        try {
            // Lấy userId từ authentication context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long currentUserId = Long.valueOf(authentication.getName());
            
            // Kiểm tra quyền truy cập
            boolean canAccess = chatService.canAccessChat(orderId, currentUserId);
            if (!canAccess) {
                return ResponseEntity.status(403).body("Bạn không có quyền truy cập cuộc trò chuyện này");
            }
            
            // Lấy lịch sử chat
            List<ChatMessage> messages = chatService.getChatHistory(orderId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy lịch sử chat: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/main/chat/order/{orderId}/check-access/{userId}
     * Kiểm tra user có quyền truy cập chat không
     */
    @GetMapping("/order/{orderId}/check-access/{userId}")
    public ResponseEntity<Boolean> checkAccess(
            @PathVariable Long orderId,
            @PathVariable Long userId) {
        boolean canAccess = chatService.canAccessChat(orderId, userId);
        return ResponseEntity.ok(canAccess);
    }
}
