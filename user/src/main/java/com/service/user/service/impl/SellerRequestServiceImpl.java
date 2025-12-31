package com.service.user.service.impl;

import com.service.user.constants.ErrorCodes;
import com.service.user.constants.SellerRequestStatus;
import com.service.user.dto.*;
import com.service.user.entity.SellerRequest;
import com.service.user.entity.User;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.SellerRequestRepository;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.SellerRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SellerRequestServiceImpl implements SellerRequestService {

    private final SellerRequestRepository sellerRequestRepo;
    private final UserRepository userRepo;
    private final UserDetailsRepository userDetailsRepo;

    @Override
    @Transactional
    public SellerRequestResponse createSellerRequest(Long userId, CreateSellerRequestDTO request) {
        // Check if user exists
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        // Check if user is already a seller
        if ("SELLER".equalsIgnoreCase(user.getRole())) {
            throw new ApplicationException(
                    ErrorCodes.USER_ALREADY_SELLER,
                    "User is already a seller"
            );
        }
        
        // Check if user already has a pending request
        if (sellerRequestRepo.existsByUserIdAndStatus(userId, SellerRequestStatus.PENDING)) {
            throw new ApplicationException(
                    ErrorCodes.SELLER_REQUEST_ALREADY_EXISTS,
                    "User already has a pending seller request"
            );
        }
        
        // Create new seller request
        SellerRequest sellerRequest = SellerRequest.builder()
                .userId(userId)
                .reason(request.getReason())
                .status(SellerRequestStatus.PENDING)
                .build();
        
        SellerRequest savedRequest = sellerRequestRepo.save(sellerRequest);
        
        log.info("Created seller request for user {}", userId);
        
        return mapToResponse(savedRequest);
    }

    @Override
    public SellerRequestResponse getMySellerRequest(Long userId) {
        SellerRequest request = sellerRequestRepo.findByUserIdAndStatus(userId, SellerRequestStatus.PENDING)
                .or(() -> sellerRequestRepo.findAllByUserId(userId).stream()
                        .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt())))
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.SELLER_REQUEST_NOT_FOUND,
                        "No seller request found for user"
                ));
        
        return mapToResponse(request);
    }

    @Override
    @Transactional
    public void cancelSellerRequest(Long userId) {
        SellerRequest request = sellerRequestRepo.findByUserIdAndStatus(userId, SellerRequestStatus.PENDING)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.SELLER_REQUEST_NOT_FOUND,
                        "No pending seller request found for user"
                ));
        
        sellerRequestRepo.delete(request);
        
        log.info("Cancelled seller request for user {}", userId);
    }

    @Override
    public PageResponse<SellerRequestResponse> getAllSellerRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SellerRequest> requestPage = sellerRequestRepo.findAll(pageable);
        
        return buildPageResponse(requestPage);
    }

    @Override
    public PageResponse<SellerRequestResponse> getSellerRequestsByStatus(SellerRequestStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SellerRequest> requestPage = sellerRequestRepo.findByStatus(status, pageable);
        
        return buildPageResponse(requestPage);
    }

    @Override
    public PageResponse<SellerRequestResponse> searchSellerRequests(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SellerRequest> requestPage = sellerRequestRepo.searchByUserEmail(keyword, pageable);
        
        return buildPageResponse(requestPage);
    }

    @Override
    public SellerRequestResponse getSellerRequestById(Long requestId) {
        SellerRequest request = sellerRequestRepo.findById(requestId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.SELLER_REQUEST_NOT_FOUND,
                        "Seller request not found with id: " + requestId
                ));
        
        return mapToResponse(request);
    }

    @Override
    @Transactional
    public SellerRequestResponse reviewSellerRequest(Long requestId, Long adminId, ReviewSellerRequestDTO reviewDTO) {
        SellerRequest request = sellerRequestRepo.findById(requestId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.SELLER_REQUEST_NOT_FOUND,
                        "Seller request not found with id: " + requestId
                ));
        
        // Check if request is already processed
        if (request.getStatus() != SellerRequestStatus.PENDING) {
            throw new ApplicationException(
                    ErrorCodes.SELLER_REQUEST_ALREADY_PROCESSED,
                    "Seller request has already been processed"
            );
        }
        
        // Update request status
        if (reviewDTO.getApproved()) {
            request.setStatus(SellerRequestStatus.APPROVED);
            
            // Upgrade user to SELLER role
            User user = userRepo.findById(request.getUserId())
                    .orElseThrow(() -> new ApplicationException(
                            ErrorCodes.USER_NOT_FOUND,
                            "User not found with id: " + request.getUserId()
                    ));
            user.setRole("SELLER");
            userRepo.save(user);
            
            log.info("Approved seller request {} for user {}", requestId, request.getUserId());
        } else {
            request.setStatus(SellerRequestStatus.REJECTED);
            log.info("Rejected seller request {} for user {}", requestId, request.getUserId());
        }
        
        request.setReviewedBy(adminId);
        request.setReviewedAt(LocalDateTime.now());
        
        SellerRequest savedRequest = sellerRequestRepo.save(request);
        
        return mapToResponse(savedRequest);
    }

    @Override
    public SellerRequestStatistics getSellerRequestStatistics() {
        long total = sellerRequestRepo.count();
        long pending = sellerRequestRepo.countByStatus(SellerRequestStatus.PENDING);
        long approved = sellerRequestRepo.countByStatus(SellerRequestStatus.APPROVED);
        long rejected = sellerRequestRepo.countByStatus(SellerRequestStatus.REJECTED);
        
        return SellerRequestStatistics.builder()
                .totalRequests(total)
                .pendingCount(pending)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .build();
    }

    /**
     * Build page response from seller request page
     */
    private PageResponse<SellerRequestResponse> buildPageResponse(Page<SellerRequest> requestPage) {
        List<SellerRequestResponse> content = requestPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<SellerRequestResponse>builder()
                .content(content)
                .totalElements(requestPage.getTotalElements())
                .totalPages(requestPage.getTotalPages())
                .size(requestPage.getSize())
                .number(requestPage.getNumber())
                .build();
    }

    /**
     * Map SellerRequest entity to SellerRequestResponse DTO
     */
    private SellerRequestResponse mapToResponse(SellerRequest request) {
        SellerRequestResponse.SellerRequestResponseBuilder builder = SellerRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .reason(request.getReason())
                .status(request.getStatus())
                .reviewedBy(request.getReviewedBy())
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt());
        
        // Get user info
        Optional<User> userOpt = userRepo.findById(request.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            builder.userEmail(user.getEmail());
            
            // Get user details
            userDetailsRepo.findByUserId(user.getId()).ifPresent(details -> {
                builder.userFullname(details.getFullname());
                builder.userAvatar(details.getAvatar());
            });
        }
        
        // Get reviewer info
        if (request.getReviewedBy() != null) {
            userRepo.findById(request.getReviewedBy())
                    .ifPresent(reviewer -> builder.reviewerEmail(reviewer.getEmail()));
        }
        
        return builder.build();
    }
}
