package com.service.main.dto;
import com.service.main.entity.Question;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class QuestionResponse {

    private Long id;
    private UserInfo user;
    private Long productId;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<AnswerResponse> answers;

    public QuestionResponse(
            Long id,
            UserInfo user,
            Long productId,
            String content,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            List<AnswerResponse> answers
    ) {
        this.id = id;
        this.user = user;
        this.productId = productId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.answers = answers;
    }
}
