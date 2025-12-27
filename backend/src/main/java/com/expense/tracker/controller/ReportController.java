package com.expense.tracker.controller;

import com.expense.tracker.model.Budget;
import com.expense.tracker.model.Expense;
import com.expense.tracker.model.Tag;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.BudgetRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.expense.tracker.dto.MonthlyReportDTO;
import com.expense.tracker.service.ReportService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BudgetRepository budgetRepository;
    @Autowired private ReportService reportService;

    @GetMapping(path = "/monthly/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> monthlyPdfReport(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year
    ) throws IOException {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(null);

        List<Object[]> categoryTotals = expenseRepository.getCategoryTotalsForMonth(userId, month, year);
        Double total = expenseRepository.getTotalExpensesForMonth(userId, month, year);
        if (total == null) total = 0.0;
        Budget budget = budgetRepository.findByUserId(userId).orElse(null);
        Double remaining = null;
        if (budget != null) {
            remaining = budget.getTotalBudget() - total;
        }

        List<Expense> expenses = expenseRepository.findByUserIdAndCategoryIdAndMonth(userId, null, month, year);

    // choose currency symbol from user preference if set
    String currency = (user.getCurrency() != null && !user.getCurrency().isBlank()) ? user.getCurrency() : "₹";

        // Build a simple PDF using PDFBox
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            // Try to load an embedded TTF font that supports wide Unicode (₹ etc.).
            // Place a TTF under src/main/resources/fonts/DejaVuSans.ttf if you want embedding.
            PDType0Font unicodeFont = null;
            try {
                java.io.InputStream fontStream = getClass().getResourceAsStream("/fonts/DejaVuSans.ttf");
                if (fontStream != null) {
                    unicodeFont = PDType0Font.load(doc, fontStream, true);
                }
            } catch (Exception ex) {
                // ignore and fall back to Type1
                unicodeFont = null;
            }

            PDPageContentStream cs = new PDPageContentStream(doc, page);
            if (unicodeFont != null) {
                cs.setFont(unicodeFont, 16);
            } else {
                cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
            }
            float margin = 50;
            float y = page.getMediaBox().getHeight() - margin;

            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Monthly Expense Report - " + month + "/" + year);
            cs.endText();

            y -= 24;
            cs.beginText();
            if (unicodeFont != null) cs.setFont(unicodeFont, 12); else cs.setFont(PDType1Font.HELVETICA, 12);
            cs.newLineAtOffset(margin, y);
            cs.showText("User: " + (user.getEmail() != null ? user.getEmail() : user.getUsername()));
            cs.endText();

            y -= 18;
            // If we couldn't load a unicode TTF, replace common currency symbols unsupported by WinAnsi
            String currencySafe = currency;
            if (unicodeFont == null) {
                // Replace rupee sign with 'Rs' so PDFBox Type1 fonts don't throw
                currencySafe = currencySafe.replace("₹", "Rs ");
            }
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Total Spent: " + currencySafe + String.format("%.2f", total));
            cs.endText();

            if (remaining != null) {
                y -= 16;
                cs.beginText();
                cs.newLineAtOffset(margin, y);
                // use the safe currency string when unicode font is not available
                cs.showText("Remaining Budget: " + currencySafe + String.format("%.2f", remaining));
                cs.endText();
            }

            // Category totals
            y -= 24;
                cs.beginText();
                cs.newLineAtOffset(margin, y);
                if (unicodeFont != null) cs.setFont(unicodeFont, 12); else cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
                cs.showText("Category Totals:");
                cs.endText();

            if (unicodeFont != null) cs.setFont(unicodeFont, 11); else cs.setFont(PDType1Font.HELVETICA, 11);
            y -= 16;
            for (Object[] row : categoryTotals) {
                String cname = (row[0] != null) ? row[0].toString() : "Uncategorized";
                Double amt = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                cs.beginText();
                cs.newLineAtOffset(margin, y);
                cs.showText("- " + cname + ": " + currencySafe + String.format("%.2f", amt));
                cs.endText();
                y -= 14;
                if (y < 80) {
                    cs.close();
                    page = new PDPage(PDRectangle.LETTER);
                    doc.addPage(page);
                    cs = new PDPageContentStream(doc, page);
                    // restore the current font on the new content stream
                    if (unicodeFont != null) cs.setFont(unicodeFont, 11); else cs.setFont(PDType1Font.HELVETICA, 11);
                    y = page.getMediaBox().getHeight() - margin;
                }
            }

            // Expense list header
            y -= 12;
            if (unicodeFont != null) cs.setFont(unicodeFont, 12); else cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Expenses:");
            cs.endText();
            if (unicodeFont != null) cs.setFont(unicodeFont, 10); else cs.setFont(PDType1Font.HELVETICA, 10);
            y -= 14;

            DateTimeFormatter df = DateTimeFormatter.ISO_LOCAL_DATE;
            for (Expense e : expenses) {
                String date = e.getDate() != null ? e.getDate().format(df) : "";
                String cname = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
                String tags = "";
                if (e.getTags() != null && !e.getTags().isEmpty()) {
                    tags = e.getTags().stream().map(Tag::getName).collect(Collectors.joining(", "));
                }
                double amt = e.getAmount() != null ? e.getAmount().doubleValue() : 0.0;
                String line = String.format("%s  |  %s  |  %s  |  %s%.2f", date, e.getName(), cname + (tags.isEmpty() ? "" : " ["+tags+"]"), currencySafe, amt);
                cs.beginText();
                cs.newLineAtOffset(margin, y);
                cs.showText(line);
                cs.endText();
                y -= 12;
                if (y < 60) {
                    cs.close();
                    page = new PDPage(PDRectangle.LETTER);
                    doc.addPage(page);
                    cs = new PDPageContentStream(doc, page);
                    // restore the current font on the new content stream (expenses use size 10)
                    if (unicodeFont != null) cs.setFont(unicodeFont, 10); else cs.setFont(PDType1Font.HELVETICA, 10);
                    y = page.getMediaBox().getHeight() - margin;
                }
            }

            cs.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);

            byte[] bytes = baos.toByteArray();

            String filename = String.format("monthly-report-%d-%02d.pdf", year, month);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

            return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(bytes);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<MonthlyReportDTO> getMonthlyReport(
            @PathVariable Long userId,
            @RequestParam int month,
            @RequestParam int year) {

        if (userId == null || month < 1 || month > 12) {
            return ResponseEntity.badRequest().build();
        }

        MonthlyReportDTO dto = reportService.getMonthlyReport(userId, month, year);
        return ResponseEntity.ok(dto);
    }
}