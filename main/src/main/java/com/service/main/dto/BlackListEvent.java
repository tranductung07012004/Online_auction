package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlackListEvent {
    private Long productId;
    private Long bidderId;
    private String bidderEmail;
}
