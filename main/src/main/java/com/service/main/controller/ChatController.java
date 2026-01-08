package com.service.main.controller;

import com.service.main.dto.ChatMessageDTO;
import com.service.main.entity.ChatMessage;
import com.service.main.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    public void sendMessage(@Payload ChatMessageDTO messageDTO) {
        try {
            // Validate and save message to database
            ChatMessage savedMessage = chatService.sendMessage(
                messageDTO.getOrderId(),
                messageDTO.getSenderId(),
                messageDTO.getMessage()
            );
            
            // Broadcast to all subscribers of this chat room (order)
            messagingTemplate.convertAndSend(
                "/topic/chat/" + messageDTO.getOrderId(),
                savedMessage
            );
            
        } catch (Exception e) {
            // Log error and optionally send error message back to sender
            System.err.println("Error sending message: " + e.getMessage());
        }
    }
}
