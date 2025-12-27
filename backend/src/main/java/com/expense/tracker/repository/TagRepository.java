package com.expense.tracker.repository;

import com.expense.tracker.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameAndUserId(String name, Long userId);
    List<Tag> findByUserId(Long userId);
}
