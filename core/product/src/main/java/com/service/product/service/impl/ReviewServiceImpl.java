package com.service.product.service.impl;

import com.service.common.constants.ErrorCodes;
import com.service.product.dto.review.response.ReviewResponse;
import com.service.product.dto.review.request.CreateReviewRequest;
import com.service.common.dto.UpdateReviewStatsRequest;
import com.service.common.dto.UserInfo;
import com.service.common.dto.UserInfoResponse;
import com.service.product.entity.Review;
import com.service.common.exception.ApplicationException;
import com.service.product.repository.ReviewRepository;
import com.service.product.service.ReviewService;
import com.service.integration.userclient.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

import com.service.common.utils.FormatUserDto;
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request, Long senderId) {
        if (request.getStatus() == null || (request.getStatus() != 0 && request.getStatus() != 1)) {
            throw new ApplicationException(ErrorCodes.VALIDATION_FAILED, 
                "Status must be 0 (dislike) or 1 (like)");
        }

        UserInfoResponse senderInfo = userServiceClient.getUserBasicInfo(senderId);
        if (senderInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Sender not found");
        }

        UserInfoResponse receiverInfo = userServiceClient.getUserBasicInfo(request.getReceiverId());
        if (receiverInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, 
                "Receiver not found");
        }

        if (senderId.equals(request.getReceiverId())) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, 
                "Cannot review yourself");
        }

        Optional<Review> existingReviewOpt = reviewRepository.findBySenderIdAndReceiverId(
                senderId,
                request.getReceiverId()
        );

        if (existingReviewOpt.isPresent()) {
            Review existingReview = existingReviewOpt.get();
            
            // If status is the same, only update comment and throw exception
            if (existingReview.getStatus().equals(request.getStatus())) {
                existingReview.setComment(request.getComment().trim());
                reviewRepository.save(existingReview);
                throw new ApplicationException(ErrorCodes.DUPLICATE_KEY,
                    "Review with same status already exists. Comment updated.");
            }
            
            // Status is different - update comment and status
            Short oldStatus = existingReview.getStatus();
            existingReview.setStatus(request.getStatus());
            existingReview.setComment(request.getComment().trim());
            Review savedReview = reviewRepository.save(existingReview);
            
            // Update review stats in user service (2 calls)
            if (oldStatus == 0 && request.getStatus() == 1) {
                // Old: dislike (0), New: like (1)
                // dislike -1, like +1
                UpdateReviewStatsRequest dislikeRequest = new UpdateReviewStatsRequest(
                        request.getReceiverId(),
                        "dislike",
                        -1
                );
                UpdateReviewStatsRequest likeRequest = new UpdateReviewStatsRequest(
                        request.getReceiverId(),
                        "like",
                        1
                );
                userServiceClient.updateReviewStats(dislikeRequest);
                userServiceClient.updateReviewStats(likeRequest);
            } else if (oldStatus == 1 && request.getStatus() == 0) {
                // Old: like (1), New: dislike (0)
                // like -1, dislike +1
                UpdateReviewStatsRequest likeRequest = new UpdateReviewStatsRequest(
                        request.getReceiverId(),
                        "like",
                        -1
                );
                UpdateReviewStatsRequest dislikeRequest = new UpdateReviewStatsRequest(
                        request.getReceiverId(),
                        "dislike",
                        1
                );
                userServiceClient.updateReviewStats(likeRequest);
                userServiceClient.updateReviewStats(dislikeRequest);
            }
            
            return mapToReviewResponse(savedReview);
        }

        OffsetDateTime now = OffsetDateTime.now();

        Review review = Review.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .status(request.getStatus())
                .comment(request.getComment().trim())
                .createdAt(now)
                .build();

        Review savedReview = reviewRepository.save(review);
        
        // Update review stats in user service
        String type = request.getStatus() == 1 ? "like" : "dislike";
        UpdateReviewStatsRequest statsRequest = new UpdateReviewStatsRequest(
                request.getReceiverId(),
                type,
                1 // Each review increases by 1
        );
        userServiceClient.updateReviewStats(statsRequest);
        
        return mapToReviewResponse(savedReview);
    }

    @Override
    public Page<ReviewResponse> getReviewsBySenderId(Long senderId, Pageable pageable) {
        // Verify sender exists
        UserInfoResponse senderInfo = userServiceClient.getUserBasicInfo(senderId);
        if (senderInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Sender not found");
        }

        Page<Review> reviews = this.reviewRepository.findBySenderId(senderId, pageable);
        return reviews.map(this::mapToReviewResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByReceiverId(Long receiverId, Pageable pageable) {
        UserInfoResponse receiverInfo = userServiceClient.getUserBasicInfo(receiverId);
        if (receiverInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Receiver not found");
        }

        Page<Review> reviews = this.reviewRepository.findByReceiverId(receiverId, pageable);
        return reviews.map(this::mapToReviewResponse);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        // Get sender info
        UserInfoResponse senderRes = userServiceClient.getUserBasicInfo(review.getSenderId());
        UserInfo sender = FormatUserDto.formatUserInfo(senderRes);
        maskFullname(sender);

        // Get receiver info
        UserInfoResponse receiverRes = userServiceClient.getUserBasicInfo(review.getReceiverId());
        UserInfo receiver = FormatUserDto.formatUserInfo(receiverRes);
        maskFullname(receiver);

        return new ReviewResponse(
                review.getId(),
                sender,
                receiver,
                review.getStatus(),
                review.getComment(),
                review.getCreatedAt()
        );
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

