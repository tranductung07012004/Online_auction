package com.service.user.repository;

import com.service.user.entity.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserDetailsRepository extends JpaRepository<UserDetails, Long> {
    @Query("SELECT ud FROM UserDetails ud WHERE ud.user_id = :userId")
    Optional<UserDetails> findByUserId(@Param("userId") Long userId);
}

