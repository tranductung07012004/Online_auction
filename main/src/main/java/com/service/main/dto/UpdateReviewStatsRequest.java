package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewStatsRequest {
    private Long receiverId;
    private String type; // "like" or "dislike"
    private Integer amount; // positive number
}

