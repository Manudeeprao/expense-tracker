package com.expense.tracker.controller;

import com.expense.tracker.dto.CreateExpenseRequest;
import com.expense.tracker.dto.ExpenseResponseDTO;
import com.expense.tracker.model.Budget;
import com.expense.tracker.model.Category;
import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.model.CategoryBudget;
import com.expense.tracker.repository.BudgetRepository;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.repository.CategoryBudgetRepository;
import com.expense.tracker.repository.TagRepository;
import com.expense.tracker.model.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin
public class ExpenseController {

    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private CategoryBudgetRepository categoryBudgetRepository;
    @Autowired private BudgetRepository budgetRepository;
    @Autowired private TagRepository tagRepository;

    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody CreateExpenseRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Budget not set for user"));

        Double totalSpent = expenseRepository.getTotalExpenseAmountByUserId(user.getId());
        if (totalSpent == null) totalSpent = 0.0; // FIX: handle null

        if ((totalSpent + request.getAmount()) > budget.getTotalBudget()) {
            return ResponseEntity.badRequest().body("❌ Budget exceeded. Expense not allowed.");
        }

    Category category = categoryRepository.findById(request.getCategoryId())
        .orElseThrow(() -> new RuntimeException("Category not found"));

    // Category budget enforcement: sum existing expenses in this category for this user
    // and ensure adding this expense does not exceed the set CategoryBudget (if exists)
    CategoryBudget categoryBudget = categoryBudgetRepository.findByUserIdAndCategoryId(user.getId(), category.getId());
    if (categoryBudget != null) {
        // Sum of expenses for this user and category
        Double spentInCategory = expenseRepository.findByUserId(user.getId()).stream()
            .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(category.getId()))
            .mapToDouble(e -> e.getAmount() == null ? 0.0 : e.getAmount()).sum();
        if ((spentInCategory + request.getAmount()) > categoryBudget.getAmount()) {
        return ResponseEntity.badRequest().body("❌ Category budget exceeded. Expense not allowed.");
        }
    }

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
    expense.setDescription(request.getDescription());
    expense.setRecurring(request.getRecurring() != null ? request.getRecurring() : false);
    expense.setRecurrence(request.getRecurrence() != null ? request.getRecurrence() : "NONE");

        // handle tags: create or find tags for this user
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            java.util.Set<Tag> tagSet = new java.util.HashSet<>();
            for (String tname : request.getTags()) {
                if (tname == null) continue;
                String trimmed = tname.trim();
                if (trimmed.isEmpty()) continue;
                Tag tag = tagRepository.findByNameAndUserId(trimmed, user.getId()).orElse(null);
                if (tag == null) {
                    tag = new Tag();
                    tag.setName(trimmed);
                    tag.setUser(user);
                    tag = tagRepository.save(tag);
                }
                tagSet.add(tag);
            }
            expense.setTags(tagSet);
        }

        Expense saved = expenseRepository.save(expense);
        return ResponseEntity.ok(mapToDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long id,
            @RequestBody CreateExpenseRequest request) {

        Optional<Expense> optionalExpense = expenseRepository.findById(id);
        if (optionalExpense.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Expense expense = optionalExpense.get();
        expense.setName(request.getName());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        if (request.getRecurring() != null) {
            expense.setRecurring(request.getRecurring());
        }
        if (request.getRecurrence() != null) {
            expense.setRecurrence(request.getRecurrence());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            // Category budget enforcement for updates: compute current spent without this expense
            CategoryBudget categoryBudget = categoryBudgetRepository.findByUserIdAndCategoryId(expense.getUser().getId(), category.getId());
            if (categoryBudget != null) {
                Double spentInCategory = expenseRepository.findByUserId(expense.getUser().getId()).stream()
                        .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(category.getId()) && !e.getId().equals(expense.getId()))
                        .mapToDouble(e -> e.getAmount() == null ? 0.0 : e.getAmount()).sum();
                if ((spentInCategory + request.getAmount()) > categoryBudget.getAmount()) {
                    return ResponseEntity.badRequest().body("❌ Category budget exceeded. Expense update not allowed.");
                }
            }

            expense.setCategory(category);
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            expense.setUser(user);
        }

        // handle tags on update
        if (request.getTags() != null) {
            java.util.Set<Tag> tagSet = new java.util.HashSet<>();
            for (String tname : request.getTags()) {
                if (tname == null) continue;
                String trimmed = tname.trim();
                if (trimmed.isEmpty()) continue;
                Tag tag = tagRepository.findByNameAndUserId(trimmed, expense.getUser().getId()).orElse(null);
                if (tag == null) {
                    tag = new Tag();
                    tag.setName(trimmed);
                    tag.setUser(expense.getUser());
                    tag = tagRepository.save(tag);
                }
                tagSet.add(tag);
            }
            expense.setTags(tagSet);
        }

        Expense updated = expenseRepository.save(expense);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @GetMapping
    public List<ExpenseResponseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> getExpenseById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> ResponseEntity.ok(mapToDTO(expense)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (!expenseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-user/{userId}")
    public List<com.expense.tracker.dto.ExpenseResponseDTO> getExpensesByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String name
    ) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        // Server-side filtering for optional parameters
        List<Expense> filtered = expenses.stream()
                .filter(e -> {
                    if (categoryId != null) {
                        if (e.getCategory() == null || !categoryId.equals(e.getCategory().getId())) return false;
                    }
                    if (startDate != null && !startDate.isBlank()) {
                        try {
                            java.time.LocalDate sd = java.time.LocalDate.parse(startDate);
                            if (e.getDate() == null || e.getDate().isBefore(sd)) return false;
                        } catch (Exception ex) {
                            // ignore parse errors and don't filter by this param
                        }
                    }
                    if (endDate != null && !endDate.isBlank()) {
                        try {
                            java.time.LocalDate ed = java.time.LocalDate.parse(endDate);
                            if (e.getDate() == null || e.getDate().isAfter(ed)) return false;
                        } catch (Exception ex) {
                            // ignore parse errors
                        }
                    }
                    if (minAmount != null) {
                        if (e.getAmount() == null || e.getAmount() < minAmount) return false;
                    }
                    if (maxAmount != null) {
                        if (e.getAmount() == null || e.getAmount() > maxAmount) return false;
                    }
                    if (name != null && !name.isBlank()) {
                        if (e.getName() == null || !e.getName().toLowerCase().contains(name.toLowerCase())) return false;
                    }
                    return true;
                })
                .toList();

        return filtered.stream().map(this::mapToDTO).toList();
    }

    @GetMapping("/by-user/{userId}/by-category")
    public List<ExpenseResponseDTO> getExpensesByUserCategoryMonth(
            @PathVariable Long userId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam int month,
            @RequestParam int year) 
            {

        List<Expense> expenses = expenseRepository.findByUserIdAndCategoryIdAndMonth(userId, categoryId, month, year);
        return expenses.stream().map(this::mapToDTO).toList();
    }

    private ExpenseResponseDTO mapToDTO(Expense expense) {
        ExpenseResponseDTO dto = new ExpenseResponseDTO();
        dto.setId(expense.getId());
        dto.setName(expense.getName());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate() != null ? expense.getDate().toString() : null);
        dto.setCategoryName(expense.getCategory() != null ? expense.getCategory().getName() : null);
        dto.setUserEmail(expense.getUser() != null ? expense.getUser().getEmail() : null);
    dto.setCategoryId(expense.getCategory() != null ? expense.getCategory().getId() : null);
        dto.setRecurring(expense.getRecurring());
        dto.setRecurrence(expense.getRecurrence());
        dto.setUserEmail(expense.getUser() != null ? expense.getUser().getEmail() : null);
        // if you want userId included as number for frontend convenience
        try {
            java.lang.reflect.Method m = dto.getClass().getMethod("setUserId", Long.class);
            if (m != null) m.invoke(dto, expense.getUser() != null ? expense.getUser().getId() : null);
        } catch (NoSuchMethodException ignore) {
            // method not present; it's optional
        } catch (Exception ex) {
            // ignore reflection errors
        }
        // include tag names
        if (expense.getTags() != null) {
            dto.setTags(expense.getTags().stream().map(Tag::getName).toList());
        }
        return dto;
    }
}