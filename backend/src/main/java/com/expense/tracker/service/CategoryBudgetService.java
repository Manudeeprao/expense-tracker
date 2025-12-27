package com.expense.tracker.service;

import com.expense.tracker.model.CategoryBudget;
import java.util.List;

public interface CategoryBudgetService {
    CategoryBudget saveCategoryBudget(CategoryBudget budget);
    List<CategoryBudget> getBudgetsByUser(Long userId);
}