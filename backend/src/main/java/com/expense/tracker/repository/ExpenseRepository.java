package com.expense.tracker.repository;

import com.expense.tracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // For monthly report chart (handles null categories as "Uncategorized")
    @Query("SELECT COALESCE(c.name, 'Uncategorized'), SUM(e.amount) " +
            "FROM Expense e LEFT JOIN e.category c " +
            "WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year " +
            "GROUP BY c.name")
    List<Object[]> getCategoryTotalsForMonth(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    Double getTotalExpensesForMonth(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);
    // For user expenses list
    List<Expense> findByUserId(Long userId);

    // For budget check
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    Double getTotalExpenseAmountByUserId(@Param("userId") Long userId);

    // Get expenses for a user filtered by optional category and specific month/year
    @Query("SELECT e FROM Expense e LEFT JOIN e.category c " +
            "WHERE e.user.id = :userId " +
            "AND (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    List<Expense> findByUserIdAndCategoryIdAndMonth(@Param("userId") Long userId,
                                                   @Param("categoryId") Long categoryId,
                                                   @Param("month") int month,
                                                   @Param("year") int year);
}