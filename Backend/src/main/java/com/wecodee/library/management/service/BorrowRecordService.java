package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.BorrowRecordDTO;
import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.model.BorrowRecord;
import com.wecodee.library.management.model.User;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import com.wecodee.library.management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowRecordService {

    private final BorrowRepository borrowRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    public BorrowRecordService(BorrowRepository borrowRecordRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
    }

    public List<BorrowRecordDTO> getAllBorrowRecords() {
        return borrowRecordRepository.findAll().stream()
                .map(BorrowRecordDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public String borrowBook(Long userId, Long bookId) {
        User user = userRepository.findByUserId(userId);
        Book book = bookRepository.findByBookId(bookId);
        if (book.getAvailableCopies() <= 0) {
            return "Book not Available";
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setBorrowDate(LocalDate.now());
        borrowRecordRepository.save(record);
        bookRepository.save(book);
        return "Book borrowed successfully";
    }
}
