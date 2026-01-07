package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private UserInfo sender;
    private UserInfo receiver;
    private Short status;
    private String comment;
    private OffsetDateTime createdAt;
}

