package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.BookDto;
import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.model.BorrowRecord;
import com.wecodee.library.management.model.User;
import com.wecodee.library.management.repository.UserRepository;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LibrarianService {

    @Autowired
    private UserRepository authRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private static BorrowRepository borrowRepository;

    public LibrarianService(BorrowRepository borrowRecordRepository) {
        borrowRepository = borrowRecordRepository;
    }

    public static List<BorrowRecord> getAllRecords() {
        return borrowRepository.findAll();
    }

    public Map<String, Object> getDashboardSummary() {
        long totalBooks = bookRepository.count();
        long borrowedBooks = bookRepository.findAll().stream().filter(Book::isBorrowed).count();
        long availableBooks = totalBooks - borrowedBooks;
        long pendingReturns = borrowRepository.findAll().stream()
                .filter(record -> record.getReturnDate() == null)
                .count();
        double totalFine = borrowRepository.findAll().stream()
                .mapToDouble(BorrowRecord::getFine)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBooks", totalBooks);
        summary.put("borrowedBooks", borrowedBooks);
        summary.put("availableBooks", availableBooks);
        summary.put("pendingReturns", pendingReturns);
        summary.put("totalFineCollected", totalFine);

        return summary;
    }

    public List<User> getAllStudentsSorted(String sortBy) {
        List<User> students = authRepository.findAll();

        if (sortBy == null) return students;

        switch (sortBy.toLowerCase()) {
            case "username":
                students.sort(Comparator.comparing(User::getUserName));
                break;
            case "userid":
                students.sort(Comparator.comparing(User::getUserId));
                break;
            case "phonenumber":
                students.sort(Comparator.comparing(User::getPhoneNumber));
                break;
        }
        return students;
    }

    public List<BookDto> getBooks(Long bookId, String bookName, String author, Boolean borrowed) {
        List<Book> books = bookRepository.findAll();

        return books.stream()
                .filter(book -> (bookId == null || book.getBookId() == bookId))
                .filter(book -> (bookName == null || book.getBookName().equalsIgnoreCase(bookName)))
                .filter(book -> (author == null || book.getAuthor().equalsIgnoreCase(author)))
                .filter(book -> (borrowed == null || book.isBorrowed() == borrowed))
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    private BookDto convertToBookDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setBookName(book.getBookName());
        dto.setAuthor(book.getAuthor());
        dto.setCategory(book.getCategory());
        dto.setBorrowed(book.isBorrowed());
        dto.setReturned(book.isReturned());
        return dto;
    }

    public List<BorrowRecord> getBorrowHistoryForStudent(Long studentId) {
        return borrowRepository.findAll().stream()
                .filter(record -> record.getUser() != null && record.getUser().getUserId()==(studentId))
                .collect(Collectors.toList());
    }


    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRepository.findAll();
    }

    public List<BorrowRecord> getBorrowRecordsByStudents(List<Long> studentIds) {
        return borrowRepository.findAll().stream()
                .filter(record -> studentIds.contains(record.getUser().getUserId()))
                .collect(Collectors.toList());
    }
}
