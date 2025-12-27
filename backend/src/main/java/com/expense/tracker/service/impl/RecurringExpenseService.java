package com.expense.tracker.service.impl;

import com.expense.tracker.model.Expense;
import com.expense.tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    // Runs every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void createDueRecurringExpenses() {
        LocalDate today = LocalDate.now();

        // Find all expenses marked recurring
        List<Expense> recurringExpenses = expenseRepository.findAll().stream()
                .filter(e -> e.getRecurring() != null && e.getRecurring())
                .toList();

        for (Expense template : recurringExpenses) {
            try {
                if (isDue(template, today)) {
                    // Avoid duplicating if an expense already exists for the user+name+date
                    boolean exists = expenseRepository.findByUserId(template.getUser().getId()).stream()
                            .anyMatch(e -> e.getDate() != null && e.getDate().equals(today) && e.getName().equals(template.getName()));
                    if (exists) continue;

                    Expense e = new Expense();
                    e.setUser(template.getUser());
                    e.setCategory(template.getCategory());
                    e.setName(template.getName());
                    e.setAmount(template.getAmount());
                    e.setDate(today);
                    e.setDescription(template.getDescription());
                    e.setRecurring(true);
                    e.setRecurrence(template.getRecurrence());
                    expenseRepository.save(e);
                }
            } catch (Exception ex) {
                // Log and continue
                System.err.println("Failed to generate recurring expense for template id=" + template.getId() + ": " + ex.getMessage());
            }
        }
    }

    private boolean isDue(Expense template, LocalDate today) {
        String r = template.getRecurrence();
        if (r == null || r.equalsIgnoreCase("NONE")) return false;
        LocalDate last = template.getDate();
        if (last == null) return true;

        switch (r.toUpperCase()) {
            case "DAILY":
                return !last.isEqual(today);
            case "WEEKLY":
                return last.plusWeeks(1).isEqual(today) || last.plusWeeks(1).isBefore(today);
            case "MONTHLY":
                return last.plusMonths(1).isEqual(today) || last.plusMonths(1).isBefore(today);
            default:
                return false;
        }
    }
}
