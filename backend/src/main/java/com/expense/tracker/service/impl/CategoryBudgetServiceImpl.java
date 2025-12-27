package com.expense.tracker.service.impl;

import com.expense.tracker.model.CategoryBudget;
import com.expense.tracker.repository.CategoryBudgetRepository;
import com.expense.tracker.service.CategoryBudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;

    @Override
    public CategoryBudget saveCategoryBudget(CategoryBudget budget) {
        return categoryBudgetRepository.save(budget);
    }

    @Override
    public List<CategoryBudget> getBudgetsByUser(Long userId) {
        return categoryBudgetRepository.findByUserId(userId);
    }
}