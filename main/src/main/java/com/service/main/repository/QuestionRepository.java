package com.service.main.repository;

import com.service.main.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT DISTINCT q FROM Question q " +
            "LEFT JOIN FETCH q.answers " +  // FETCH answers ngay từ đầu
            "WHERE q.productId = :productId " +
            "ORDER BY q.createdAt DESC")
    Page<Question> findByProductIdWithAnswers(@Param("productId") Long productId, Pageable pageable);
}