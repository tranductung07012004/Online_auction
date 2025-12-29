package com.service.main.repository;

import com.service.main.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Query("SELECT a FROM Answer a WHERE a.question.id = :questionId ORDER BY a.createdAt ASC")
    List<Answer> findByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.question.id = :questionId")
    long countByQuestionId(@Param("questionId") Long questionId);
}
