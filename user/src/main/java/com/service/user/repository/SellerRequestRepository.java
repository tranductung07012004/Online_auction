package com.service.user.repository;

import com.service.user.constants.SellerRequestStatus;
import com.service.user.entity.SellerRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SellerRequestRepository extends JpaRepository<SellerRequest, Long> {
    
    // Find by user ID
    Optional<SellerRequest> findByUserId(Long userId);
    
    // Find all by user ID
    List<SellerRequest> findAllByUserId(Long userId);
    
    // Find pending request by user ID
    Optional<SellerRequest> findByUserIdAndStatus(Long userId, SellerRequestStatus status);
    
    // Check if user has pending request
    boolean existsByUserIdAndStatus(Long userId, SellerRequestStatus status);
    
    // Find by status with pagination
    Page<SellerRequest> findByStatus(SellerRequestStatus status, Pageable pageable);
    
    // Find all with pagination
    Page<SellerRequest> findAll(Pageable pageable);
    
    // Count by status
    long countByStatus(SellerRequestStatus status);
    
    // Search by user email or business name
    @Query("SELECT sr FROM SellerRequest sr WHERE sr.userId IN " +
            "(SELECT u.id FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SellerRequest> searchByUserEmail(@Param("keyword") String keyword, Pageable pageable);
}
