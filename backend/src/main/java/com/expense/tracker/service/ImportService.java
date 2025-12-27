package com.expense.tracker.service;

import com.expense.tracker.model.Category;
import com.expense.tracker.model.Expense;
import com.expense.tracker.model.User;
import com.expense.tracker.repository.CategoryRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImportService {

    private final CategoryRepository categoryRepository;

    public ImportService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public static class ImportResult {
        public int created = 0;
        public List<String> errors = new ArrayList<>();
    }

    // Heuristic parsing: try to find columns date/amount/name/description/category by header or position
    public List<Expense> parseFileToExpenses(MultipartFile file, User user, ImportResult result) {
        List<Expense> out = new ArrayList<>();
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        try (InputStream is = file.getInputStream()) {
            if (name.endsWith(".csv") || name.endsWith(".txt")) {
                out.addAll(parseCsv(is, user, result));
            } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
                out.addAll(parseXlsx(is, user, result));
            } else {
                // Try CSV first
                out.addAll(parseCsv(is, user, result));
            }
        } catch (Exception e) {
            result.errors.add("Failed to process file: " + e.getMessage());
        }
        return out;
    }

    private List<Expense> parseCsv(InputStream is, User user, ImportResult result) {
        List<Expense> out = new ArrayList<>();
        try (InputStreamReader reader = new InputStreamReader(is)) {
            CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader);
            Map<String, Integer> headerMap = parser.getHeaderMap();
            for (CSVRecord rec : parser) {
                try {
                    Map<String, String> r = new HashMap<>();
                    for (String h : headerMap.keySet()) {
                        r.put(h.toLowerCase().trim(), rec.get(h));
                    }
                    Expense e = mapRecordToExpense(r, user);
                    if (e != null) {
                        out.add(e);
                    }
                } catch (Exception ex) {
                    result.errors.add("Row parse error: " + ex.getMessage());
                }
            }
        } catch (Exception ex) {
            result.errors.add("CSV parse error: " + ex.getMessage());
        }
        return out;
    }

    private List<Expense> parseXlsx(InputStream is, User user, ImportResult result) {
        List<Expense> out = new ArrayList<>();
        try (XSSFWorkbook workbook = new XSSFWorkbook(is)) {
            XSSFSheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            boolean first = true;
            List<String> headers = new ArrayList<>();
            for (Row row : sheet) {
                if (first) {
                    for (Cell cell : row) {
                        headers.add(formatter.formatCellValue(cell).toLowerCase().trim());
                    }
                    first = false;
                    continue;
                }
                try {
                    Map<String, String> r = new HashMap<>();
                    int i = 0;
                    for (Cell cell : row) {
                        String val = formatter.formatCellValue(cell);
                        String key = (i < headers.size() && headers.get(i) != null && !headers.get(i).isEmpty()) ? headers.get(i) : "col" + i;
                        r.put(key, val);
                        i++;
                    }
                    Expense e = mapRecordToExpense(r, user);
                    if (e != null) out.add(e);
                } catch (Exception ex) {
                    result.errors.add("Row parse error: " + ex.getMessage());
                }
            }
        } catch (Exception ex) {
            result.errors.add("XLSX parse error: " + ex.getMessage());
        }
        return out;
    }

    private Expense mapRecordToExpense(Map<String, String> rec, User user) {
        // Try to find amount, date, name, description, category
        String amountStr = findKey(rec, "amount", "amt", "value", "debit", "credit");
        String dateStr = findKey(rec, "date", "transaction date", "txn date", "posted date");
        String name = findKey(rec, "name", "title", "payee", "merchant", "narration");
        String desc = findKey(rec, "description", "desc", "details", "note");
        String categoryName = findKey(rec, "category", "cat");

        if ((amountStr == null || amountStr.isBlank()) && (name == null || name.isBlank())) {
            // Not a valid expense row
            return null;
        }

        Double amount = parseAmount(amountStr);
        LocalDate date = parseDate(dateStr);

        Expense e = new Expense();
        e.setUser(user);
        e.setName(name != null ? name : "Imported Expense");
        e.setDescription(desc != null ? desc : "");
        e.setAmount(amount != null ? amount : 0.0);
        e.setDate(date != null ? date : LocalDate.now());

        if (categoryName != null && !categoryName.isBlank()) {
            Category cat = categoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
            if (cat != null) e.setCategory(cat);
        }

        return e;
    }

    private String findKey(Map<String, String> rec, String... keys) {
        for (String k : keys) {
            for (String rk : rec.keySet()) {
                if (rk == null) continue;
                if (rk.equalsIgnoreCase(k) || rk.toLowerCase().contains(k.toLowerCase())) {
                    return rec.get(rk);
                }
            }
        }
        return null;
    }

    private Double parseAmount(String s) {
        if (s == null) return null;
        try {
            // Remove currency symbols and commas
            String cleaned = s.replaceAll("[^0-9.-]", "");
            if (cleaned.isBlank()) return null;
            return Double.parseDouble(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseDate(String s) {
        if (s == null) return null;
        s = s.trim();
        // Handle Excel DATE(yyyy,mm,dd) formulas like =DATE(2023,12,31)
        try {
            String up = s.toUpperCase();
            if (up.contains("DATE(")) {
                int start = up.indexOf("DATE(") + 5;
                int end = up.indexOf(')', start);
                if (end > start) {
                    String inside = up.substring(start, end);
                    String[] parts = inside.split("[,\\s]+");
                    if (parts.length >= 3) {
                        int y = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
                        int m = Integer.parseInt(parts[1].replaceAll("[^0-9]", ""));
                        int d = Integer.parseInt(parts[2].replaceAll("[^0-9]", ""));
                        return LocalDate.of(y, m, d);
                    }
                }
            }
        } catch (Exception ignored) {}
        // Try ISO
        try {
            return LocalDate.parse(s);
        } catch (DateTimeParseException ignored) {}

        // Common patterns
        String[] patterns = {"d-M-uuuu","d/M/uuuu","dd-MM-uuuu","dd/MM/uuuu","M/d/uuuu","uuuu/MM/dd"};
        for (String p : patterns) {
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern(p);
                return LocalDate.parse(s, fmt);
            } catch (Exception ignored) {}
        }

        // Last resort: try to extract digits
        String digits = s.replaceAll("[^0-9]", " ").trim();
        String[] parts = digits.split("\\s+");
        if (parts.length >= 3) {
            try {
                int d = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                int y = Integer.parseInt(parts[2]);
                if (y < 100) y += 2000;
                return LocalDate.of(y, m, d);
            } catch (Exception ignored) {}
        }

        return null;
    }
}
