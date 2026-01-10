package com.service.main.repository;

import com.service.main.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.senderId = :senderId ORDER BY r.createdAt DESC")
    Page<Review> findBySenderId(@Param("senderId") Long senderId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.senderId = :senderId AND r.receiverId = :receiverId")
    Optional<Review> findBySenderIdAndReceiverId(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId
    );

    @Query("SELECT r FROM Review r WHERE r.receiverId = :receiverId ORDER BY r.createdAt DESC")
    Page<Review> findByReceiverId(@Param("receiverId") Long receiverId, Pageable pageable);
}

