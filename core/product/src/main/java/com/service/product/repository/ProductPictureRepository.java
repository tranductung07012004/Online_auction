package com.service.product.repository;

import com.service.product.entity.ProductPictureInProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductPictureRepository extends JpaRepository<ProductPictureInProduct, Integer> {
}


