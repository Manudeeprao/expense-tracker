package com.expense.tracker.dto;

import java.time.LocalDate;

public class CreateExpenseRequest {

    private Long userId;
    private Long categoryId;
    private String name;
    private Double amount;
    private LocalDate date;
    private String description;
    private Boolean recurring;
    private String recurrence; // NONE, DAILY, WEEKLY, MONTHLY
    private java.util.List<String> tags;

    // ✅ Add Getters
    public Long getUserId() {
        return userId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public Double getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getRecurring() {
        return recurring;
    }

    public String getRecurrence() {
        return recurrence;
    }

    public java.util.List<String> getTags() { return tags; }

    // (Optional) Add Setters if needed
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setDate(java.time.LocalDate date) {
        this.date = date;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }

    public void setRecurrence(String recurrence) {
        this.recurrence = recurrence;
    }

    public void setTags(java.util.List<String> tags) { this.tags = tags; }
}
