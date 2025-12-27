package com.expense.tracker.repository;

import com.expense.tracker.model.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByUserId(Long userId);
    // find budget for a specific user and category
    CategoryBudget findByUserIdAndCategoryId(Long userId, Long categoryId);
}