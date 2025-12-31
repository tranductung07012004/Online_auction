package com.service.user.entity;

import com.service.user.constants.SellerRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "seller_requests")
public class SellerRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SellerRequestStatus status = SellerRequestStatus.PENDING;

    private Long reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
