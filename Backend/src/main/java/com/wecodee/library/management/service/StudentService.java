package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.StudentHomeDTO;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRepository borrowRecordRepository;

    public StudentHomeDTO getStudentHomeSummary(long studentId) {
        long totalBooks            = bookRepository.count();
        long totalBorrowedCount    = borrowRecordRepository.countByUserId(studentId);
        long currentlyBorrowedCount= borrowRecordRepository.countCurrentlyBorrowed(studentId);
        double totalFine           = borrowRecordRepository.totalFineByUserId(studentId);
        return new StudentHomeDTO(totalBooks, totalBorrowedCount, currentlyBorrowedCount, totalFine);
    }
}
