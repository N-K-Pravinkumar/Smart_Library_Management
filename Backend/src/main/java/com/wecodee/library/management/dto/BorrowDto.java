package com.wecodee.library.management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BorrowDto {
    private long studentId;
    private long bookId;
    private String bookTitle;
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private double fine;
    private boolean pay;
}
