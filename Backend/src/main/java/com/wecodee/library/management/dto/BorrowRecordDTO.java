package com.wecodee.library.management.dto;

import com.wecodee.library.management.model.BorrowRecord;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowRecordDTO {
    private Long borrowId;
    private Long bookId;
    private String bookName;
    private Long studentId;
    private String studentName;
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private int overDueDays;
    private double fine;
    private boolean pay;
    private int daysRemaining;
    private boolean returned;

    public static BorrowRecordDTO fromEntity(BorrowRecord record) {
        BorrowRecordDTO dto = new BorrowRecordDTO();
        dto.setBorrowId(record.getBorrowId());
        if (record.getBook() != null) {
            dto.setBookId(record.getBook().getBookId());
            dto.setBookName(record.getBook().getBookName());
        }
        if (record.getUser() != null) {
            dto.setStudentId(record.getUser().getUserId());
            dto.setStudentName(record.getUser().getUserName());
        }
        dto.setBorrowDate(record.getBorrowDate());
        dto.setReturnDate(record.getReturnDate());
        dto.setOverDueDays(record.getOverDueDays());
        dto.setFine(record.getFine());
        dto.setPay(record.isPay());
        dto.setReturned(record.isPay());
        return dto;
    }
}
