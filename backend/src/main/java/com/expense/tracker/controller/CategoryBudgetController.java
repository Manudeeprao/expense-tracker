package com.expense.tracker.controller;

import com.expense.tracker.model.CategoryBudget;
import com.expense.tracker.repository.CategoryBudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/category-budgets")
@CrossOrigin
public class CategoryBudgetController {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;
    @Autowired
    private com.expense.tracker.repository.CategoryRepository categoryRepository;

    @GetMapping("/by-user/{userId}")
    public List<CategoryBudget> getBudgetsByUser(@PathVariable Long userId) {
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserId(userId);
        // Attach category name into a transient field by returning a simple projection-like map
        // (the frontend also maps, but returning categoryName here helps keep UI simpler)
        return budgets.stream().map(b -> {
            // Load category if available
            categoryRepository.findById(b.getCategoryId()).ifPresent(cat -> {
                // We will set the category name into a transient field if desired - but since
                // CategoryBudget entity doesn't have such a field, we'll rely on frontend mapping.
            });
            return b;
        }).toList();
    }

    @PostMapping
    public CategoryBudget saveCategoryBudget(@RequestBody CategoryBudget budget) {
        // Prevent creating duplicate category budgets for the same user+category
        if (budget.getUserId() == null || budget.getCategoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and categoryId are required");
        }

        // If creating a new budget (no id) ensure one doesn't already exist
        if (budget.getId() == null) {
            CategoryBudget existing = categoryBudgetRepository.findByUserIdAndCategoryId(budget.getUserId(), budget.getCategoryId());
            if (existing != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A budget for this category already exists. Use Edit to update it.");
            }
        } else {
            // If updating, ensure we're not changing to a category that another budget already uses
            CategoryBudget existing = categoryBudgetRepository.findByUserIdAndCategoryId(budget.getUserId(), budget.getCategoryId());
            if (existing != null && !existing.getId().equals(budget.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Another budget for this category already exists.");
            }
        }

        return categoryBudgetRepository.save(budget);
    }

    @DeleteMapping("/{id}")
    public void deleteCategoryBudget(@PathVariable Long id) {
        categoryBudgetRepository.deleteById(id);
    }
}