package com.service.main.controller;

import com.service.main.dto.*;
import com.service.main.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;


    @PostMapping
    public ResponseEntity<?> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long currentUserId = Long.valueOf(authentication.getName());

        QuestionResponse res = questionService.createQuestion(request, currentUserId);

        return ResponseEntity.status(201)
                .body(new ApiResponse<>("Question created successfully", res));
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getQuestionsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<QuestionResponse> questions = questionService.getQuestionsByProductId(productId, pageable);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Questions retrieved successfully", questions));
    }

    @PostMapping("/answers")
    public ResponseEntity<ApiResponse<AnswerResponse>> createAnswer(
            @Valid @RequestBody CreateAnswerRequest request
    ) {
        System.out.print("11111111111111111111111111111");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long currentUserId = Long.valueOf(authentication.getName());

        AnswerResponse res = questionService.createAnswer(request, currentUserId);

        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Answer created successfully", res));
    }
}