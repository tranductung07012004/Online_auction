package com.service.worker.repository;

import com.service.worker.entity.Product;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p.id, p.currentPrice FROM Product p WHERE p.id IN :productIds")
    List<Object[]> findProductCurPriceAndIdByIds(@Param("productIds") List<Long> productIds);
}
