package com.service.main.controller;

import com.service.main.dto.ChatMessageDTO;
import com.service.main.entity.ChatMessage;
import com.service.main.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Client gửi tin nhắn đến: /app/chat/send
     * Server sẽ broadcast tin nhắn đến tất cả clients subscribe: /topic/chat/{orderId}
     */
    @MessageMapping("/chat/send")
    public void sendMessage(
            @Payload ChatMessageDTO messageDTO,
            Authentication authentication
    ) {
        try {
            // Kiểm tra authentication
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("User not authenticated");
            }

            // Lấy userId từ principal (đã được set từ X-user-id header)
            String userIdStr = (String) authentication.getPrincipal();
            Long senderId = Long.parseLong(userIdStr);

            // Validate and save message to database
            ChatMessage savedMessage = chatService.sendMessage(
                    messageDTO.getOrderId(),
                    senderId,
                    messageDTO.getMessage()
            );

            // Broadcast to all subscribers of this chat room (order)
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + messageDTO.getOrderId(),
                    savedMessage
            );

        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}