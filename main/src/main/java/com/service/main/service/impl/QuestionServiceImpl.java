package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.*;
import com.service.main.entity.Answer;
import com.service.main.entity.Product;
import com.service.main.entity.Question;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.AnswerRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.repository.QuestionRepository;
import com.service.main.service.QuestionService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ProductRepository productRepository;
    private final UserServiceClient userServiceClient;
    private final AnswerRepository answerRepository;


    @Override
    public QuestionResponse createQuestion(CreateQuestionRequest request, Long currentUserId) {
        this.productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        OffsetDateTime now = OffsetDateTime.now();

        Question question = Question.builder()
                .userId(currentUserId)
                .productId(request.getProductId())
                .content(request.getContent().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Question saved = questionRepository.save(question);

        return this.mapToQuestionResponse(saved);
    }

    @Override
    public Page<QuestionResponse> getQuestionsByProductId(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found");
        }

        Page<Question> questions = questionRepository.findByProductIdWithAnswers(productId, pageable);

        return questions.map(this::mapToQuestionResponse);
    }

    private QuestionResponse mapToQuestionResponse(Question q) {
        Long userId = q.getUserId();
        UserInfoResponse res = this.userServiceClient.getUserBasicInfo(userId);
        UserInfo user =  formatUserInfo(res);

        // Map answers (đã được load sẵn nhờ JOIN FETCH)
        List<AnswerResponse> answerDTOs = q.getAnswers().stream()
                .map(answer -> {
                    Long answerUserId = answer.getUserId();
                    UserInfoResponse answerUserRes = userServiceClient.getUserBasicInfo(answerUserId);
                    UserInfo answerUser = formatUserInfo(answerUserRes);

                    return new AnswerResponse(
                            answer.getId(),
                            answerUser,
                            q.getId(),
                            answer.getContent(),
                            answer.getCreatedAt(),
                            answer.getUpdatedAt()
                    );
                })
                .toList();

        return new QuestionResponse(
                q.getId(),
                user,
                q.getProductId(),
                q.getContent(),
                q.getCreatedAt(),
                q.getUpdatedAt(),
                answerDTOs
        );
    }

    @Override
    public AnswerResponse createAnswer(CreateAnswerRequest request, Long currentUserId) {
         Question question = questionRepository.findById(request.getQuestionId())
                 .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Question not found"));

        long currentAnswerCount = answerRepository.countByQuestionId(question.getId());
        if (currentAnswerCount >= 2) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "This question has already reached the maximum of 2 answers");
        }

        OffsetDateTime now = OffsetDateTime.now();

        Answer answer = Answer.builder()
                .userId(currentUserId)
                .question(question)
                .content(request.getContent().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();
        System.out.println(currentUserId);
        System.out.println(request.getQuestionId());


        Answer saved = answerRepository.save(answer);

        UserInfoResponse userRes = userServiceClient.getUserBasicInfo(currentUserId);
        UserInfo user = formatUserInfo(userRes);

        return new AnswerResponse(saved, user);
    }
}
