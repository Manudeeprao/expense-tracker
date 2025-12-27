package com.expense.tracker.service;

import com.expense.tracker.model.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category updateCategory(Long id, Category category); // ✅ Added
    void deleteCategory(Long id);
}
