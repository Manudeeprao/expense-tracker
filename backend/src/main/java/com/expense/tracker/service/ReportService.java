package com.expense.tracker.service;

import com.expense.tracker.dto.MonthlyReportDTO;

public interface ReportService {
    MonthlyReportDTO getMonthlyReport(Long userId, int month, int year);
}
