package com.expense.tracker.controller;

import com.expense.tracker.dto.BudgetRequestDTO;
import com.expense.tracker.dto.BudgetResponseDTO;
import com.expense.tracker.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // ✅ POST /api/budget/{userId}
    @PostMapping("/{userId}")
    public ResponseEntity<BudgetResponseDTO> createOrUpdateBudget(
            @PathVariable Long userId,
            @RequestBody BudgetRequestDTO requestDTO) {

        BudgetResponseDTO response = budgetService.createOrUpdateBudget(userId, requestDTO);
        return ResponseEntity.ok(response);
    }

    // ✅ GET /api/budget/{userId}/remaining
    @GetMapping("/{userId}/remaining")
    public ResponseEntity<Double> getRemainingBudget(@PathVariable Long userId) {
        double remaining = budgetService.getRemainingBudget(userId);
        return ResponseEntity.ok(remaining);
    }

    // ✅ GET /api/budget/status/{userId}
    // Optional query params: month and year to get monthly status for a specific month
    @GetMapping("/status/{userId}")
    public ResponseEntity<BudgetResponseDTO> getBudgetStatus(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        return ResponseEntity.ok(budgetService.getBudgetStatus(userId, month, year));
    }
}
