package com.wecodee.library.management.dto;

import com.wecodee.library.management.model.BorrowRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private Long id;
    private Long bookId;
    private String bookName;
    private Long userId;
    private String userName;
    private String borrowDate;
    private String returnDate;
    private int overDueDays;
    private double fine;
    private boolean paid;

    public static TransactionDTO fromEntity(BorrowRecord record) {
        if (record == null) return null;

        return TransactionDTO.builder()
                .id(record.getBorrowId())
                .bookId(record.getBook() != null ? record.getBook().getBookId() : null)
                .bookName(record.getBook() != null ? record.getBook().getBookName() : null)
                .userId(record.getUser() != null ? record.getUser().getUserId() : null)
                .userName(record.getUser() != null ? record.getUser().getUserName() : null)
                .borrowDate(record.getBorrowDate() != null ? record.getBorrowDate().toString() : null)
                .returnDate(record.getReturnDate() != null ? record.getReturnDate().toString() : null)
                .overDueDays(record.getOverDueDays())
                .fine(record.getFine())
                .paid(record.isPay())
                .build();
    }
}
