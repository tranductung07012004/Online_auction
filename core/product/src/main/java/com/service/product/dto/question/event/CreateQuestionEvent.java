package com.service.product.dto.question.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionEvent {
    private Long productId;
    private Long bidderId;
    private String bidderEmail;
    private Long sellerId;
    private String sellerEmail;
    private String content;
}
