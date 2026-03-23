package com.wecodee.library.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDashboardDTO {
    private long totalBooks;
    private long borrowedBooksCount;
    private long notReturnedCount;
    private double totalFine;
    private List<BorrowRecordDTO> currentBorrowedBooks;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BorrowSummary {
        private Long bookId;
        private String bookName;
        private LocalDate borrowDate;
        private LocalDate returnDate;
        private int daysRemaining;
        private double fine;
    }
}
