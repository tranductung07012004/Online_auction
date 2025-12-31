package com.service.user.dto;

import com.service.user.constants.SellerRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRequestResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullname;
    private String userAvatar;
    private String reason;
    private String businessName;
    private String businessAddress;
    private String phoneNumber;
    private SellerRequestStatus status;
    private String adminNote;
    private Long reviewedBy;
    private String reviewerEmail;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
