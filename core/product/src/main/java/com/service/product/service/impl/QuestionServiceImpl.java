package com.service.product.service.impl;

import com.service.common.dto.UserEmailItemResponse;
import com.service.common.dto.UserInfo;
import com.service.common.constants.ErrorCodes;
import com.service.common.constants.KafkaEventTypes;
import com.service.common.constants.KafkaTopics;
import com.service.product.dto.question.event.CreateAnswerEvent;
import com.service.product.dto.question.event.CreateQuestionEvent;
import com.service.product.dto.question.request.CreateAnswerRequest;
import com.service.product.dto.question.request.CreateQuestionRequest;
import com.service.product.dto.question.response.AnswerResponse;
import com.service.product.dto.question.response.QuestionResponse;
import com.service.product.entity.*;
import com.service.product.entity.AutoBidInProduct;
import com.service.common.exception.ApplicationException;

import com.service.product.entity.ProductInProduct;
import com.service.product.entity.BlackListInProduct;
import com.service.product.repository.AnswerRepository;
import com.service.product.repository.AutoBidRepositoryInProduct;
import com.service.product.repository.BlackListRepositoryInProduct;
import com.service.product.repository.ProductRepositoryInProduct;
import com.service.product.repository.QuestionRepository;
import com.service.product.service.QuestionService;
import com.service.integration.userclient.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.service.integration.messaging.KafkaProducerService;

import com.service.common.utils.FormatUserDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ProductRepositoryInProduct productRepository;
    private final UserServiceClient userServiceClient;
    private final AnswerRepository answerRepository;
    private final KafkaProducerService kafkaProducerService;
    private final AutoBidRepositoryInProduct autoBidRepository;
    private final BlackListRepositoryInProduct blackListRepository;


    @Override
    public QuestionResponse createQuestion(CreateQuestionRequest request, Long currentUserId) {
        ProductInProduct product = this.productRepository.findById(request.getProductId())
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

        // Send event to worker after successfully creating question
        try {
            Long sellerId = product.getSellerId();
            
            // Get user emails
            List<Long> userIds = new ArrayList<>();
            userIds.add(currentUserId); // bidderId
            userIds.add(sellerId); // sellerId
            
            List<UserEmailItemResponse> emailResponses = userServiceClient.getUserEmails(userIds);
            Map<Long, String> emailMap = emailResponses.stream()
                    .collect(Collectors.toMap(UserEmailItemResponse::getUserId, UserEmailItemResponse::getEmail));
            
            CreateQuestionEvent event = CreateQuestionEvent.builder()
                    .productId(request.getProductId())
                    .bidderId(currentUserId)
                    .bidderEmail(emailMap.get(currentUserId))
                    .sellerId(sellerId)
                    .sellerEmail(emailMap.get(sellerId))
                    .content(request.getContent().trim())
                    .build();
            
            kafkaProducerService.sendMessage(
                    KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                    KafkaEventTypes.CREATE_QUESTION,
                    event
            );
            
            log.info("Sent CREATE_QUESTION event for productId: {}, bidderId: {}, sellerId: {}",
                    request.getProductId(), currentUserId, sellerId);
        } catch (Exception e) {
            log.error("Error sending CREATE_QUESTION event for productId: {}, bidderId: {}: {}",
                    request.getProductId(), currentUserId, e.getMessage(), e);
            // Don't throw exception, just log error - question creation is already successful
        }

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
        com.service.common.dto.UserInfoResponse res = this.userServiceClient.getUserBasicInfo(userId);
        UserInfo user =  FormatUserDto.formatUserInfo(res);
        
        // Mask fullname before returning
        maskFullname(user);

        // Map answers (đã được load sẵn nhờ JOIN FETCH)
        List<AnswerResponse> answerDTOs = q.getAnswers().stream()
                .map(answer -> {
                    Long answerUserId = answer.getUserId();
                    com.service.common.dto.UserInfoResponse answerUserRes = userServiceClient.getUserBasicInfo(answerUserId);
                    UserInfo answerUser = FormatUserDto.formatUserInfo(answerUserRes);
                    
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

        com.service.common.dto.UserInfoResponse userRes = userServiceClient.getUserBasicInfo(currentUserId);
        UserInfo user = FormatUserDto.formatUserInfo(userRes);
        
        // Mask fullname before returning
        maskFullname(user);

        // Send event to worker after successfully creating answer
        try {
            Long productId = question.getProductId();
            
            // Get userList1: Users who created auto-bid for this product (excluding blacklisted)
            List<AutoBidInProduct> autoBids = autoBidRepository.findByProductIdReturnList(productId);
            List<BlackListInProduct> blackLists = blackListRepository.findByProductIdReturnList(productId);
            
            Set<Long> blacklistedBidderIds = blackLists.stream()
                    .map(BlackListInProduct::getBidderId)
                    .collect(Collectors.toSet());
            
            List<Long> userList1 = autoBids.stream()
                    .map(AutoBidInProduct::getBidderId)
                    .filter(bidderId -> !blacklistedBidderIds.contains(bidderId))
                    .collect(Collectors.toList());
            
            // Get userList2: Users who created questions for this product
            List<Long> userList2 = questionRepository.findUserIdsByProductId(productId);
            
            // Merge and deduplicate
            Set<Long> allUserIds = new HashSet<>(userList1);
            allUserIds.addAll(userList2);
            List<Long> mergedUserIds = new ArrayList<>(allUserIds);
            
            // Get emails for all users
            List<UserEmailItemResponse> userEmails = userServiceClient.getUserEmails(mergedUserIds);
            
            // Get seller info to get fullname
            ProductInProduct product = productRepository.findById(productId)
                    .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product id" + productId + "not found"));
            Long sellerId = product.getSellerId();
            UserInfo sellerInfo = userServiceClient.getUserInfoById(sellerId);
            String sellerFullname = sellerInfo != null ? sellerInfo.getFullname() : "Seller name unknown";
            
            // Create and send event
            CreateAnswerEvent event = CreateAnswerEvent.builder()
                    .productId(productId)
                    .sellerFullname(sellerFullname)
                    .content(request.getContent().trim())
                    .users(userEmails)
                    .build();
            
            kafkaProducerService.sendMessage(
                    KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                    KafkaEventTypes.CREATE_ANSWER,
                    event
            );
            
            log.info("Sent CREATE_ANSWER event for productId: {}, questionId: {}, total users: {}",
                    productId, request.getQuestionId(), userEmails.size());
        } catch (Exception e) {
            log.error("Error sending CREATE_ANSWER event for questionId: {}: {}",
                    request.getQuestionId(), e.getMessage(), e);
            // Don't throw exception, just log error - answer creation is already successful
        }

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
