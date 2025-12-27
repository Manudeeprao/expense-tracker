package com.expense.tracker.service.impl;

import com.expense.tracker.dto.BudgetRequestDTO;
import com.expense.tracker.dto.BudgetResponseDTO;
import com.expense.tracker.model.Budget;
import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.BudgetRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Autowired
    public BudgetServiceImpl(BudgetRepository budgetRepository, UserRepository userRepository, ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public BudgetResponseDTO createOrUpdateBudget(Long userId, BudgetRequestDTO requestDTO) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        Budget budget = budgetRepository.findByUser(user).orElse(new Budget());
        budget.setTotalBudget(requestDTO.getTotalBudget());
        budget.setUser(user);
        budget = budgetRepository.save(budget);

        return mapToDTO(budget, userId);
    }

    @Override
    public BudgetResponseDTO getBudgetSummary(Long userId) {
        return getBudgetStatus(userId);
    }

    @Override
    public double getRemainingBudget(Long userId) {
        return calculateRemaining(userId);
    }

    @Override
    public BudgetResponseDTO getBudgetStatus(Long userId) {
        return getBudgetStatus(userId, null, null);
    }

    @Override
    public BudgetResponseDTO getBudgetStatus(Long userId, Integer month, Integer year) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        // Gracefully handle the case where a budget doesn't exist
        Optional<Budget> optionalBudget = budgetRepository.findByUser(user);
        if (optionalBudget.isEmpty()) {
            return null; // Return null instead of throwing an exception
        }
        Budget budget = optionalBudget.get();
        return mapToDTO(budget, userId, month, year);
    }

    public BudgetResponseDTO getBudgetByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Optional<Budget> optionalBudget = budgetRepository.findByUser(user);
        if (optionalBudget.isEmpty()) {
            return null; // ✅ Return null
        }
        Budget budget = optionalBudget.get();
        return mapToDTO(budget, userId);
    }

    // Backward-compatible overload: delegate to the new mapToDTO with null month/year
    private BudgetResponseDTO mapToDTO(Budget budget, Long userId) {
        return mapToDTO(budget, userId, null, null);
    }

    // Backward-compatible overload for calculateRemaining
    private double calculateRemaining(Long userId) {
        return calculateRemaining(userId, null, null);
    }

    private double calculateUsedAmount(Long userId, Integer month, Integer year) {
        // If month/year are null, fall back to current month/year
        LocalDate now = LocalDate.now();
        int m = (month == null) ? now.getMonthValue() : month;
        int y = (year == null) ? now.getYear() : year;
        Double total = expenseRepository.getTotalExpensesForMonth(userId, m, y);
        return total == null ? 0.0 : total.doubleValue();
    }

    private double calculateRemaining(Long userId, Integer month, Integer year) {
        Budget budget = budgetRepository.findByUser(
                userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"))
        ).orElseThrow(() -> new RuntimeException("Budget not found"));

        return budget.getTotalBudget() - calculateUsedAmount(userId, month, year);
    }

    private BudgetResponseDTO mapToDTO(Budget budget, Long userId, Integer month, Integer year) {
        double totalExpenses = calculateUsedAmount(userId, month, year);
        double remaining = budget.getTotalBudget() - totalExpenses;

        BudgetResponseDTO dto = new BudgetResponseDTO();
        dto.setId(budget.getId());
        dto.setUserId(userId);
        dto.setTotalBudget(budget.getTotalBudget());
        dto.setTotalExpenses(totalExpenses);
        dto.setRemainingBudget(remaining);
        // Alert logic: near limit when remaining is <= 10% of total budget
        double threshold = budget.getTotalBudget() * 0.10;
        dto.setAlertThreshold(threshold);
        dto.setNearLimit(remaining <= threshold);
        return dto;
    }
}
