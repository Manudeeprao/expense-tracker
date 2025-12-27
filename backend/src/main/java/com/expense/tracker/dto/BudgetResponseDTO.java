package com.expense.tracker.dto;

public class BudgetResponseDTO {
    private Long id;
    private Long userId;
    private double totalBudget;
    private double totalExpenses;
    private double remainingBudget;
    private boolean nearLimit;
    private double alertThreshold;

    // Getters and setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public double getTotalBudget() {
        return totalBudget;
    }
    public void setTotalBudget(double totalBudget) {
        this.totalBudget = totalBudget;
    }

    public double getTotalExpenses() {
        return totalExpenses;
    }
    public void setTotalExpenses(double totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public double getRemainingBudget() {
        return remainingBudget;
    }
    public void setRemainingBudget(double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public boolean isNearLimit() {
        return nearLimit;
    }

    public void setNearLimit(boolean nearLimit) {
        this.nearLimit = nearLimit;
    }

    public double getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(double alertThreshold) {
        this.alertThreshold = alertThreshold;
    }
}
