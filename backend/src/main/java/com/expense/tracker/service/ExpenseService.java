package com.expense.tracker.service;

import com.expense.tracker.dto.CreateExpenseRequest;
import com.expense.tracker.model.Expense;

import java.util.List;

public interface ExpenseService {
    Expense createExpense(CreateExpenseRequest request);
    List<Expense> getAllExpenses();
    Expense getExpenseById(Long id);
    void deleteExpense(Long id);
    List<Expense> getExpensesByUserId(Long userId);
    Expense updateExpense(Long id, Expense updatedExpense);
}
