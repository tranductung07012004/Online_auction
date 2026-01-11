package com.service.worker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnswerEvent {
    private Long productId;
    private String sellerFullname;
    private String content;
    private List<UserEmailItemResponse> users; // List of users with their emails
}
