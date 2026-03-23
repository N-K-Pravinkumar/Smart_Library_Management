package com.wecodee.library.management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserdashboardDTO {
    private long totalBooks;
    private long borrowedBooksCount;
    private long notReturnedCount;
    private double totalFine;

    // What type is currentBorrowedBooks?
    private List<BorrowDto> currentBorrowedBooks;
}
