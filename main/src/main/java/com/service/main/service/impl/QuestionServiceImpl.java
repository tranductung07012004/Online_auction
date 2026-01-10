package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.*;
import com.service.main.entity.Answer;
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
        
        // Mask fullname before returning
        maskFullname(user);

        // Map answers (đã được load sẵn nhờ JOIN FETCH)
        List<AnswerResponse> answerDTOs = q.getAnswers().stream()
                .map(answer -> {
                    Long answerUserId = answer.getUserId();
                    UserInfoResponse answerUserRes = userServiceClient.getUserBasicInfo(answerUserId);
                    UserInfo answerUser = formatUserInfo(answerUserRes);
                    
                    // Mask fullname before returning
                    maskFullname(answerUser);

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
        
        // Mask fullname before returning
        maskFullname(user);

        return new AnswerResponse(saved, user);
    }

    /**
     * Masks the fullname field in UserInfo by masking some characters of each word
     * Example: "nguyen van aabcc" -> "nguy*e v** a**cc"
     * @param userInfo UserInfo object to mask (can be null)
     */
    private static void maskFullname(UserInfo userInfo) {
        if (userInfo != null && userInfo.getFullname() != null) {
            String fullname = userInfo.getFullname().trim();
            if (fullname.isEmpty()) {
                userInfo.setFullname("**");
                return;
            }
            
            // Split by spaces to get words
            String[] words = fullname.split("\\s+");
            StringBuilder masked = new StringBuilder();
            
            for (int i = 0; i < words.length; i++) {
                if (i > 0) {
                    masked.append(" ");
                }
                masked.append(maskWord(words[i]));
            }
            
            userInfo.setFullname(masked.toString());
        }
    }
    
    /**
     * Masks a single word by keeping some characters at the beginning and end,
     * masking the middle part with *
     * @param word the word to mask
     * @return masked word
     */
    private static String maskWord(String word) {
        if (word == null || word.isEmpty()) {
            return "**";
        }
        
        int length = word.length();
        
        if (length <= 2) {
            // If word is too short, mask completely
            return "**";
        } else if (length == 3) {
            // Keep first character, mask the rest
            return word.charAt(0) + "**";
        } else if (length == 4) {
            // Keep first 2 characters, mask 1, keep last 1
            return word.substring(0, 2) + "*" + word.charAt(length - 1);
        } else if (length == 5) {
            // Keep first 1 character, mask 2, keep last 2
            return word.charAt(0) + "**" + word.substring(length - 2);
        } else {
            // For longer words: keep first 4 characters, mask middle, keep last 1-2 characters
            int keepStart = 4;
            int keepEnd = length >= 7 ? 2 : 1;
            int maskLength = length - keepStart - keepEnd;
            
            StringBuilder masked = new StringBuilder();
            masked.append(word.substring(0, keepStart));
            for (int i = 0; i < maskLength; i++) {
                masked.append("*");
            }
            masked.append(word.substring(length - keepEnd));
            
            return masked.toString();
        }
    }
}
