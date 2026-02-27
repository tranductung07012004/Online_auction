package com.service.admin.repository;

import com.service.admin.entity.CategoriesInAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoriesRepositoryInAdmin extends JpaRepository<CategoriesInAdmin, Integer> {
  CategoriesInAdmin findByName(String name);

  Page<CategoriesInAdmin> findByNameContainingIgnoreCase(String name, Pageable pageable);

  @Query(value = """
          SELECT *
          FROM categories
          WHERE parent_id IS NOT NULL
            AND LOWER(name) LIKE LOWER(CONCAT('%', :keyword, '%'))
      """, countQuery = """
          SELECT COUNT(*)
          FROM categories
          WHERE parent_id IS NOT NULL
            AND LOWER(name) LIKE LOWER(CONCAT('%', :keyword, '%'))
      """, nativeQuery = true)
  Page<CategoriesInAdmin> searchChildCategories(
      @Param("keyword") String name,
      Pageable pageable);

  @Query(value = """
          SELECT *
          FROM categories
          WHERE parent_id IS NULL
            AND LOWER(name) LIKE LOWER(CONCAT('%', :keyword, '%'))
      """, countQuery = """
          SELECT COUNT(*)
          FROM categories
          WHERE parent_id IS NULL
            AND LOWER(name) LIKE LOWER(CONCAT('%', :keyword, '%'))
      """, nativeQuery = true)
  Page<CategoriesInAdmin> searchParentCategories(
          @Param("keyword") String name,
          Pageable pageable);

  @Query(value = """
          SELECT COUNT(*)
          FROM product_category
          WHERE category_id = :categoryId
      """, nativeQuery = true)
  Long countProductsByCategoryId(@Param("categoryId") Integer categoryId);

  @Query(value = """
          SELECT COUNT(*)
          FROM categories
          WHERE parent_id = :categoryId
      """, nativeQuery = true)
  Long countChildCategoriesByParentId(@Param("categoryId") Integer categoryId);

  // Dashboard: Get top categories by product count
  @Query(value = """
          SELECT c.id, c.name, COUNT(pc.id) as product_count
          FROM categories c
          LEFT JOIN product_category pc ON c.id = pc.category_id
          WHERE c.parent_id IS NOT NULL
          GROUP BY c.id, c.name
          ORDER BY product_count DESC
          LIMIT :limit
      """, nativeQuery = true)
  java.util.List<Object[]> findTopCategoriesByProductCount(@Param("limit") int limit);
}
