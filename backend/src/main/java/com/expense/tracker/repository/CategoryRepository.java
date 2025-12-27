package com.expense.tracker.repository;

import com.expense.tracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    java.util.Optional<Category> findByNameIgnoreCase(String name);
    java.util.List<Category> findByParentId(Long parentId);
    java.util.List<Category> findByParentIsNull();
}
