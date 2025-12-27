package com.expense.tracker.service.impl;

import com.expense.tracker.model.Category;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category createCategory(Category category) {
        // If parent provided with only id, resolve it to managed entity
        if (category.getParent() != null && category.getParent().getId() != null) {
            categoryRepository.findById(category.getParent().getId()).ifPresent(category::setParent);
        }
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category updateCategory(Long id, Category updatedCategory) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(updatedCategory.getName());
            category.setDescription(updatedCategory.getDescription());
            if (updatedCategory.getParent() != null && updatedCategory.getParent().getId() != null) {
                categoryRepository.findById(updatedCategory.getParent().getId()).ifPresent(category::setParent);
            } else {
                category.setParent(null);
            }
            return categoryRepository.save(category);
        }).orElse(null);
    }

    @Override
    public void deleteCategory(Long id) {
        // Before deleting, detach children (set their parent to null) to avoid FK constraint issues
        java.util.List<Category> children = categoryRepository.findByParentId(id);
        for (Category child : children) {
            child.setParent(null);
            categoryRepository.save(child);
        }
        categoryRepository.deleteById(id);
    }
}
