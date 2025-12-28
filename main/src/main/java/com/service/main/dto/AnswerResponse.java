package com.service.main.dto;

import com.service.main.entity.Answer;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AnswerResponse {

    private Long id;
    private UserInfo user;
    private Long questionId;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public AnswerResponse(
            Long id,
            UserInfo user,
            Long questionId,
            String content,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {
        this.id = id;
        this.user = user;
        this.questionId = questionId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public AnswerResponse(Answer answer, UserInfo user) {
        this.id = answer.getId();
        this.user = user;
        this.questionId = answer.getQuestion().getId();
        this.content = answer.getContent();
        this.createdAt = answer.getCreatedAt();
        this.updatedAt = answer.getUpdatedAt();
    }
}