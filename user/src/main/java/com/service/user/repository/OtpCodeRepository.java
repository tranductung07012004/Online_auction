package com.service.user.repository;

import com.service.user.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    @Query("""
                SELECT o
                FROM OtpCode o
                WHERE o.userId = :userId
                  AND o.email = :email
                  AND o.used = false
                ORDER BY o.createdAt DESC
            """)
    Optional<OtpCode> findLatestActiveOtp(
            @Param("userId") Long userId,
            @Param("email") String email);
}
