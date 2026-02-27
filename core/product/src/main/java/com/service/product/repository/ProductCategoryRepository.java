package com.service.product.repository;

import com.service.product.entity.ProductCategoryInProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategoryInProduct, Long> {
}


