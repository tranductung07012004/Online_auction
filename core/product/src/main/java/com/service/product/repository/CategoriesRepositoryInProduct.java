package com.service.product.repository;

import com.service.product.entity.CategoriesInProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoriesRepositoryInProduct extends JpaRepository<CategoriesInProduct, Integer> {
}
