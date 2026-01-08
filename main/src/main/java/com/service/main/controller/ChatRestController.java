package com.service.main.controller;

import com.service.main.entity.ChatMessage;
import com.service.main.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatRestController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * GET /api/chat/order/{orderId}/messages
     * Lấy lịch sử chat của một order
     */
    @GetMapping("/order/{orderId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long orderId) {
        try {
            List<ChatMessage> messages = chatService.getChatHistory(orderId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * GET /api/chat/order/{orderId}/check-access/{userId}
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
