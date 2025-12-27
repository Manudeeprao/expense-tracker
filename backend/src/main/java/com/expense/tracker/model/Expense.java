    package com.expense.tracker.model;
    import com.fasterxml.jackson.annotation.JsonBackReference;
    import com.fasterxml.jackson.annotation.JsonIgnore;
    import jakarta.persistence.*;
    import java.time.LocalDate;
    @Entity
    public class Expense {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String name;
        private Double amount;
        private LocalDate date;
        private String description;
        // Recurrence fields
        private Boolean recurring = false;
        // simple recurrence: "NONE", "DAILY", "WEEKLY", "MONTHLY"
        private String recurrence = "NONE";

        // ✅ Category without JsonBackReference
        @ManyToOne
        @JoinColumn(name = "category_id")
        private Category category;

        // ✅ Backref only here
        @ManyToOne
        @JoinColumn(name = "user_id")
        @JsonIgnore // 🔁 correctly paired with @JsonManagedReference in User
        private User user;
        @ManyToMany
        @JoinTable(
            name = "expense_tags",
            joinColumns = @JoinColumn(name = "expense_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
        )
        private java.util.Set<Tag> tags;

        // Getters & Setters
        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }
        public void setName(String name) {
            this.name = name;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Boolean getRecurring() {
            return recurring;
        }

        public void setRecurring(Boolean recurring) {
            this.recurring = recurring;
        }

        public String getRecurrence() {
            return recurrence;
        }

        public void setRecurrence(String recurrence) {
            this.recurrence = recurrence;
        }

        public Category getCategory() {
            return category;
        }

        public void setCategory(Category category) {
            this.category = category;
        }
        public User getUser() {
            return user;
        }
        public void setUser(User user) {
            this.user = user;
        }
        public java.util.Set<Tag> getTags() { return tags; }
        public void setTags(java.util.Set<Tag> tags) { this.tags = tags; }
    }