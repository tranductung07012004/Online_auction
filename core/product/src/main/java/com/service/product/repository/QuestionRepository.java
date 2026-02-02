package com.service.product.repository;

import com.service.product.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT DISTINCT q FROM Question q " +
            "LEFT JOIN FETCH q.answers " +  // FETCH answers ngay từ đầu
            "WHERE q.productId = :productId " +
            "ORDER BY q.createdAt DESC")
    Page<Question> findByProductIdWithAnswers(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT DISTINCT q.userId FROM Question q WHERE q.productId = :productId")
    List<Long> findUserIdsByProductId(@Param("productId") Long productId);
}