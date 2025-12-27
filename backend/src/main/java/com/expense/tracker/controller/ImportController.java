package com.expense.tracker.controller;

import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.ImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@CrossOrigin
public class ImportController {

    @Autowired private ImportService importService;
    @Autowired private UserRepository userRepository;
    @Autowired private ExpenseRepository expenseRepository;

    @PostMapping
    public ResponseEntity<?> importFile(@RequestParam("file") MultipartFile file,
                                        @RequestParam("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        ImportService.ImportResult res = new ImportService.ImportResult();
        List<Expense> expenses = importService.parseFileToExpenses(file, user, res);

        try {
            if (!expenses.isEmpty()) {
                expenseRepository.saveAll(expenses);
            }
            Map<String, Object> out = new HashMap<>();
            out.put("created", expenses.size());
            out.put("errors", res.errors);
            return ResponseEntity.ok(out);
        } catch (Exception ex) {
            res.errors.add("Save error: " + ex.getMessage());
            return ResponseEntity.status(500).body(Map.of("created", 0, "errors", res.errors));
        }
    }
}
