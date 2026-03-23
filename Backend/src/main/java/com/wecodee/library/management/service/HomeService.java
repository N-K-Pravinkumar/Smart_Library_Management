// src/main/java/com/wecodee/library/management/service/DashboardService.java
package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.HomeDTO;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;

    public HomeDTO getDashboardSummary() {
        long totalBooks = bookRepository.count();
        var records = borrowRepository.findAll();
        System.out.println("Books: " + bookRepository.count());
        System.out.println("Records: " + borrowRepository.findAll().size());

        long totalBorrowed = records.stream().filter(r -> r.getReturnDate() == null).count();
        long totalReturned = records.stream().filter(r -> r.getReturnDate() != null).count();
        long totalMembers = records.stream().map(r -> r.getUser().getUserId()).distinct().count();
        double totalFine = records.stream().mapToDouble(r -> r.getFine()).sum();

        return new HomeDTO(
                totalBooks,
                totalMembers,
                totalBorrowed,
                totalReturned,
                totalBorrowed,  // same as not returned
                totalFine
        );
}}
