    package com.expense.tracker.service;

    import com.expense.tracker.dto.BudgetRequestDTO;
    import com.expense.tracker.dto.BudgetResponseDTO;
    import com.expense.tracker.model.Expense;
    import com.expense.tracker.repository.ExpenseRepository;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    public interface BudgetService {
        BudgetResponseDTO createOrUpdateBudget(Long userId, BudgetRequestDTO request);
        BudgetResponseDTO getBudgetSummary(Long userId);
        double getRemainingBudget(Long userId);
        // getBudgetStatus: overloads provided. If month/year are null, current month is used.
        BudgetResponseDTO getBudgetStatus(Long userId);
        BudgetResponseDTO getBudgetStatus(Long userId, Integer month, Integer year);
    }
