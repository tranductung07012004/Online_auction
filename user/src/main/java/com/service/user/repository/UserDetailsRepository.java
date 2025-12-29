package com.service.user.repository;

import com.service.user.entity.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserDetailsRepository extends JpaRepository<UserDetails, Long> {
    @Query("SELECT ud FROM UserDetails ud WHERE ud.user_id = :userId")
    Optional<UserDetails> findByUserId(@Param("userId") Long userId);

    @Query("SELECT ud.user_id FROM UserDetails ud WHERE " +
            "LOWER(ud.fullname) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(ud.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Long> searchUserIdsByKeyword(@Param("keyword") String keyword);

    // Dashboard queries
    @Query("SELECT COUNT(ud) FROM UserDetails ud WHERE ud.verified = true")
    long countVerifiedUsers();

    @Query("SELECT COUNT(ud) FROM UserDetails ud WHERE ud.verified = false")
    long countUnverifiedUsers();

    @Query("SELECT COUNT(ud) FROM UserDetails ud WHERE ud.created_at >= :startDate")
    long countUsersCreatedAfter(@Param("startDate") java.time.LocalDateTime startDate);
}

