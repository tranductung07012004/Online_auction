package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.ReviewResponse;
import com.service.main.dto.CreateReviewRequest;
import com.service.main.dto.UpdateReviewStatsRequest;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.entity.Review;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.ReviewRepository;
import com.service.main.service.ReviewService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

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
        UserInfo sender = formatUserInfo(senderRes);

        // Get receiver info
        UserInfoResponse receiverRes = userServiceClient.getUserBasicInfo(review.getReceiverId());
        UserInfo receiver = formatUserInfo(receiverRes);

        return new ReviewResponse(
                review.getId(),
                sender,
                receiver,
                review.getStatus(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}

