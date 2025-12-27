package com.expense.tracker.service.impl;

import com.expense.tracker.dto.CreateExpenseRequest;
import com.expense.tracker.model.Budget;
import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.model.Category;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.BudgetRepository;
import com.expense.tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private BudgetRepository budgetRepository;

    @Override
    public Expense createExpense(CreateExpenseRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = new Expense();
        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setUser(user);
        expense.setCategory(category);

        return expenseRepository.save(expense);
    }

    @Override
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Override
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    @Override
    public List<Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    @Override
    public Expense updateExpense(Long id, Expense updatedExpense) {
        return expenseRepository.findById(id).map(expense -> {
            expense.setName(updatedExpense.getName());
            expense.setAmount(updatedExpense.getAmount());
            expense.setDate(updatedExpense.getDate());
            expense.setDescription(updatedExpense.getDescription());
            expense.setCategory(updatedExpense.getCategory());
            return expenseRepository.save(expense);
        }).orElse(null);
    }

    public boolean isBudgetExceeded(Long userId, Double newExpenseAmount) {
        Double totalSpent = expenseRepository.getTotalExpenseAmountByUserId(userId);
        if (totalSpent == null) totalSpent = 0.0; // FIX: handle null
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Budget budget = budgetRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Budget not set for user"));

        return (totalSpent + newExpenseAmount) > budget.getTotalBudget();
    }
}