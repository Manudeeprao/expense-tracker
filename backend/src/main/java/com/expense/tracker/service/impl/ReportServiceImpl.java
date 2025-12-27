package com.expense.tracker.service.impl;

import com.expense.tracker.dto.MonthlyReportDTO;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.service.ReportService;
import com.expense.tracker.repository.BudgetRepository;
import com.expense.tracker.model.Budget;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Override
    public MonthlyReportDTO getMonthlyReport(Long userId, int month, int year) {
        Double total = expenseRepository.getTotalExpensesForMonth(userId, month, year);
        if (total == null) total = 0.0;

        List<Object[]> categoryTotalsRaw = expenseRepository.getCategoryTotalsForMonth(userId, month, year);
        Map<String, Double> categoryTotals = new HashMap<>();
        for (Object[] row : categoryTotalsRaw) {
            String category = (row[0] != null && !row[0].toString().isEmpty()) ? row[0].toString() : "Uncategorized";
            Double amount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            categoryTotals.put(category, amount);
        }

        MonthlyReportDTO dto = new MonthlyReportDTO();
        dto.setTotalExpenses(total);
        dto.setCategoryTotals(categoryTotals);

        // compute top category
        String topCategory = null;
        double topAmount = 0.0;
        for (Map.Entry<String, Double> en : categoryTotals.entrySet()) {
            if (en.getValue() != null && en.getValue() > topAmount) {
                topAmount = en.getValue();
                topCategory = en.getKey();
            }
        }
        dto.setTopCategory(topCategory);

        // remaining budget
        Optional<Budget> budgetOpt = budgetRepository.findByUserId(userId);
        if (budgetOpt.isPresent()) {
            Budget b = budgetOpt.get();
            dto.setRemainingBudget(b.getTotalBudget() - total);
        } else {
            dto.setRemainingBudget(null);
        }

        return dto;
    }
}