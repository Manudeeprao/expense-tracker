package com.expense.tracker.repository;
import com.expense.tracker.model.Budget;
import com.expense.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUser(User user);
    Optional<Budget> findByUserId(Long userId);
}
