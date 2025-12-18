package com.service.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KafkaMessage {
    private String messageId;
    private String eventType;  // VD: "AUTHOR_CREATED", "USER_REGISTERED"
    private Object payload;    // Data thực tế
    private String source;     // Service gửi message
    private LocalDateTime timestamp;
}
