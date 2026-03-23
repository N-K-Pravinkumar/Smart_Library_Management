package com.wecodee.library.management.controller;

import com.wecodee.library.management.dto.StudentHomeDTO;
import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.model.BorrowRecord;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import com.wecodee.library.management.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:4200")
public class StudentController {

    private final BorrowRepository borrowRepository;
    private final BookRepository bookRepository;
    private final StudentService studentService;

    public StudentController(BorrowRepository borrowRepository,
                             BookRepository bookRepository,
                             StudentService studentService) {
        this.borrowRepository = borrowRepository;
        this.bookRepository   = bookRepository;
        this.studentService   = studentService;
    }

    @GetMapping("/home/{studentId}")
    public StudentHomeDTO getStudentHome(@PathVariable long studentId) {
        return studentService.getStudentHomeSummary(studentId);
    }

    @GetMapping("/transaction/{studentId}")
    public ResponseEntity<List<BorrowRecord>> getStudentTransactions(@PathVariable Long studentId) {
        return ResponseEntity.ok(borrowRepository.findByUser_UserId(studentId));
    }

    @PutMapping("/transaction/{borrowId}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long borrowId) {
        BorrowRecord borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        LocalDate today = LocalDate.now();
        int overdueDays = 0;
        double fineAmount = 0;
        if (borrow.getBorrowDate().plusDays(2).isBefore(today)) {
            overdueDays = (int) java.time.temporal.ChronoUnit.DAYS.between(
                    borrow.getBorrowDate().plusDays(2), today);
            fineAmount = overdueDays * 10.0;
        }

        borrow.setOverDueDays(overdueDays);
        borrow.setFine(fineAmount);

        if (fineAmount > 0 && !borrow.isPay()) {
            return ResponseEntity.ok(Map.of(
                    "message", "You need to pay fine before returning",
                    "fine", fineAmount,
                    "borrowId", borrow.getBorrowId()
            ));
        }

        borrow.setReturnDate(today);
        borrow.setPay(true);
        borrowRepository.save(borrow);

        Book book = borrow.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setBorrowed(false);
        book.setReturned(true);
        bookRepository.save(book);

        return ResponseEntity.ok(Map.of("message", "Book returned successfully"));
    }

    @PutMapping("/transaction/{borrowId}/pay")
    public ResponseEntity<?> payFine(@PathVariable Long borrowId) {
        BorrowRecord borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        borrow.setPay(true);
        Book book = borrow.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        borrowRepository.save(borrow);
        return ResponseEntity.ok(Map.of("message", "Fine paid successfully", "borrowId", borrow.getBorrowId()));
    }
}
