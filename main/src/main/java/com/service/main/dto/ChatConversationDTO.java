package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationDTO {
    private Long orderId;
    private String productName;
    private String productThumbnail;
    private Long otherUserId;
    private String otherUserName;
    private String orderStatus;
}
