package com.service.product.repository;

import com.service.product.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.question.id = :questionId")
    long countByQuestionId(@Param("questionId") Long questionId);
}
