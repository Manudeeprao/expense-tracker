package com.expense.tracker.controller;

import com.expense.tracker.model.User;
import com.expense.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // DTO for password change request
    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email).orElse(null); // <-- FIXED
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        return ResponseEntity.ok(user);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        if (updatedUser.getCurrency() != null) user.setCurrency(updatedUser.getCurrency());
        userRepository.save(user);
        return ResponseEntity.ok("Account updated successfully!");
    }
    @PutMapping("/by-email/{email}")
    public ResponseEntity<?> updateUserByEmail(@PathVariable String email, @RequestBody User updatedUser) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        if (updatedUser.getCurrency() != null) user.setCurrency(updatedUser.getCurrency());
        userRepository.save(user);
        return ResponseEntity.ok("Account updated successfully!");
    }
    // (dev password-reset helper removed)
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(
                    new ErrorResponse("User not found")
            );
        }
        if (!passwordEncoder.matches(request.oldPassword, user.getPassword())) {
            return ResponseEntity.status(400).body(
                    new ErrorResponse("Old password is incorrect")
            );
        }
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }
    @PutMapping("/by-email/{email}/password")
    public ResponseEntity<?> changePasswordByEmail(@PathVariable String email, @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        if (!passwordEncoder.matches(request.oldPassword, user.getPassword())) {
            return ResponseEntity.status(400).body(new ErrorResponse("Old password is incorrect"));
        }
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }

    // Error response DTO
    public static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) { this.error = error; }
    }

    // Password-reset DTO removed

    // ...other endpoints...
}