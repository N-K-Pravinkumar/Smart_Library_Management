package com.wecodee.library.management.controller;

import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.model.BorrowRecord;
import com.wecodee.library.management.model.User;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import com.wecodee.library.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/student/book")
@CrossOrigin(origins = "http://localhost:4200")
public class BookController {

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private BorrowRepository borrowRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<Map<String, Object>> getAllBooks() {
        List<Book> books = bookRepo.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Book book : books) {
            Map<String, Object> map = new HashMap<>();
            map.put("bookId", book.getBookId());
            map.put("bookName", book.getBookName());
            map.put("author", book.getAuthor());
            map.put("category", book.getCategory());
            map.put("availableCopies", book.getAvailableCopies());
            map.put("totalCopies", book.getTotalCopies());
            map.put("borrowed", book.getAvailableCopies() == 0);  // calculated dynamically
            response.add(map);
        }

        return response;
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestParam Long studentId, @RequestParam Long bookId) {

        try {
            long activeBorrows = borrowRepo.countByUser_UserIdAndReturnDateIsNull(studentId);
            if (activeBorrows >= 3) {
                throw new RuntimeException("You can only borrow up to 3 books at a time!");
            }

            Book book = bookRepo.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            // Correct check
            if (book.getAvailableCopies() <= 0) {
                throw new RuntimeException("No copies available!");
            }

            User user = userRepo.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            BorrowRecord borrow = new BorrowRecord();
            borrow.setUser(user);
            borrow.setBook(book);
            borrow.setBorrowDate(LocalDate.now());
            borrow.setReturnDate(null);
            borrow.setFine(0.0);
            borrow.setPay(false);
            borrowRepo.save(borrow);

            // Update count
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepo.save(book);

            return ResponseEntity.ok(Map.of(
                    "message", "Book borrowed successfully — Return within 2 days",
                    "availableCopies", book.getAvailableCopies()
            ));

        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/return/{bookId}")
    public ResponseEntity<?> returnBook(@PathVariable Long bookId, @RequestParam Long studentId) {

        try {
            BorrowRecord borrow = borrowRepo
                    .findByUser_UserIdAndBook_BookIdAndReturnDateIsNull(studentId, bookId)
                    .orElseThrow(() -> new RuntimeException("Borrow record not found"));

            borrow.setReturnDate(LocalDate.now());
            borrowRepo.save(borrow);

            Book book = borrow.getBook();

            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepo.save(book);

            return ResponseEntity.ok(Map.of(
                    "message", "Book returned successfully",
                    "availableCopies", book.getAvailableCopies()
            ));

        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
    @GetMapping("/borrowed/count/{studentId}")
    public ResponseEntity<?> getBorrowedCount(@PathVariable Long studentId) {
        long count = borrowRepo.countByUser_UserIdAndReturnDateIsNull(studentId);
        return ResponseEntity.ok(count);
    }
}
