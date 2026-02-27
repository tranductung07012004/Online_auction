package com.service.product.repository;

import com.service.product.entity.ProductDescriptionInProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductDescriptionRepository extends JpaRepository<ProductDescriptionInProduct, Integer> {
}


