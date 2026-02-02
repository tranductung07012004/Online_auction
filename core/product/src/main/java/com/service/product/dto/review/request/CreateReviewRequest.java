package com.service.product.dto.review.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReviewRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    @NotNull(message = "Status is required")
    private Short status; // 0 = dislike, 1 = like

    @NotBlank(message = "Comment is required")
    private String comment;
}

