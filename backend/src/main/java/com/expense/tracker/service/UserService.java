package com.expense.tracker.service;

import com.expense.tracker.model.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    List<User> getAllUsers();
    User getUserById(Long id);
    User updateUser(Long id, User updatedUser); // ✅ Add this line
    void deleteUser(Long id);
}
