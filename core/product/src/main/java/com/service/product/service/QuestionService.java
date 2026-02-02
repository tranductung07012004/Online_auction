package com.service.product.service;

import com.service.product.dto.question.response.AnswerResponse;
import com.service.product.dto.question.request.CreateAnswerRequest;
import com.service.product.dto.question.request.CreateQuestionRequest;
import com.service.product.dto.question.response.QuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuestionService {

    QuestionResponse createQuestion(CreateQuestionRequest request, Long currentUserId);

    Page<QuestionResponse> getQuestionsByProductId(Long productId, Pageable pageable);

    AnswerResponse createAnswer(CreateAnswerRequest request, Long currentUserId);
}
