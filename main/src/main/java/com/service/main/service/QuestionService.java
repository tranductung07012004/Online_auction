package com.service.main.service;

import com.service.main.dto.AnswerResponse;
import com.service.main.dto.CreateAnswerRequest;
import com.service.main.dto.CreateQuestionRequest;
import com.service.main.dto.QuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuestionService {

    QuestionResponse createQuestion(CreateQuestionRequest request, Long currentUserId);

    Page<QuestionResponse> getQuestionsByProductId(Long productId, Pageable pageable);

    AnswerResponse createAnswer(CreateAnswerRequest request, Long currentUserId);
}
