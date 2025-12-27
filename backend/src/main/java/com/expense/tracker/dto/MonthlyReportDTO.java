package com.expense.tracker.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Getter
@Setter
public class MonthlyReportDTO {
    private double totalExpenses;
    private Map<String, Double> categoryTotals;
    private String topCategory;
    private Double remainingBudget;

    public MonthlyReportDTO() {}

    public MonthlyReportDTO(double totalExpenses, Map<String, Double> categoryTotals) {
        this.totalExpenses = totalExpenses;
        this.categoryTotals = categoryTotals;
    }

    public String getTopCategory() {
        return topCategory;
    }

    public void setTopCategory(String topCategory) {
        this.topCategory = topCategory;
    }

    public Double getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(Double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }
}