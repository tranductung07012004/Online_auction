package com.service.user.service.impl;

import com.service.user.constants.SellerRequestStatus;
import com.service.user.dto.AdminDashboardUserStats;
import com.service.user.dto.RecentUserDTO;
import com.service.user.entity.User;
import com.service.user.repository.SellerRequestRepository;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepo;
    private final UserDetailsRepository userDetailsRepo;
    private final SellerRequestRepository sellerRequestRepo;

    @Override
    public AdminDashboardUserStats getUserStatistics() {
        // User counts by role
        long totalUsers = userRepo.count();
        long adminCount = userRepo.countByRole("ADMIN");
        long sellerCount = userRepo.countByRole("SELLER");
        long bidderCount = userRepo.countByRole("BIDDER");

        // Verification stats
        long verifiedUsers = userDetailsRepo.countVerifiedUsers();
        long unverifiedUsers = userDetailsRepo.countUnverifiedUsers();

        // Seller request stats
        long pendingSellerRequests = sellerRequestRepo.countByStatus(SellerRequestStatus.PENDING);
        long approvedSellerRequests = sellerRequestRepo.countByStatus(SellerRequestStatus.APPROVED);
        long rejectedSellerRequests = sellerRequestRepo.countByStatus(SellerRequestStatus.REJECTED);

        // Recent activity - new users
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.with(LocalTime.MIN);
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        long newUsersToday = userDetailsRepo.countUsersCreatedAfter(startOfToday);
        long newUsersThisWeek = userDetailsRepo.countUsersCreatedAfter(startOfWeek);
        long newUsersThisMonth = userDetailsRepo.countUsersCreatedAfter(startOfMonth);

        return AdminDashboardUserStats.builder()
                .totalUsers(totalUsers)
                .adminCount(adminCount)
                .sellerCount(sellerCount)
                .bidderCount(bidderCount)
                .verifiedUsers(verifiedUsers)
                .unverifiedUsers(unverifiedUsers)
                .pendingSellerRequests(pendingSellerRequests)
                .approvedSellerRequests(approvedSellerRequests)
                .rejectedSellerRequests(rejectedSellerRequests)
                .newUsersToday(newUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .newUsersThisMonth(newUsersThisMonth)
                .build();
    }

    @Override
    public List<RecentUserDTO> getRecentUsers(int limit) {
        List<User> recentUsers = userRepo.findTop10ByOrderByIdDesc();
        
        return recentUsers.stream()
                .limit(limit)
                .map(user -> {
                    RecentUserDTO.RecentUserDTOBuilder builder = RecentUserDTO.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .role(user.getRole());

                    userDetailsRepo.findByUserId(user.getId()).ifPresent(details -> {
                        builder.fullname(details.getFullname())
                                .avatar(details.getAvatar())
                                .verified(details.getVerified())
                                .createdAt(details.getCreated_at());
                    });

                    return builder.build();
                })
                .collect(Collectors.toList());
    }
}
