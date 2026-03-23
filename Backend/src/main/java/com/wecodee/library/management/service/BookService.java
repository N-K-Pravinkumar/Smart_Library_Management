package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.BookDto;
import com.wecodee.library.management.dto.details;
import com.wecodee.library.management.dto.entireDetails;
import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.model.User;
import com.wecodee.library.management.repository.BookRepository;
import com.wecodee.library.management.repository.BorrowRepository;
import com.wecodee.library.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private BorrowRepository borrowRepository;
    @Autowired
    private UserRepository userRepository;

    public BookDto saveBook(BookDto dto) {
        Book book = new Book();
        book.setBookName(dto.getBookName());
        book.setAuthor(dto.getAuthor());
        book.setCategory(dto.getCategory());
        book.setBorrowed(dto.isBorrowed());
        book.setReturned(dto.isReturned());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setTotalCopies(dto.getTotalCopies() > 0 ? dto.getTotalCopies() : dto.getAvailableCopies());
        return convertToDto(bookRepository.save(book));
    }

    public List<BookDto> getAllBooks() {
        return bookRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<BookDto> searchBooks(Long bookId, String bookName, String author) {
        return bookRepository.findAll().stream()
                .filter(b -> bookId   == null || b.getBookId().equals(bookId))
                .filter(b -> bookName == null || b.getBookName().toLowerCase().contains(bookName.toLowerCase()))
                .filter(b -> author   == null || b.getAuthor().toLowerCase().contains(author.toLowerCase()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BookDto getBookById(Long id) {
        return bookRepository.findById(id).map(this::convertToDto).orElse(null);
    }

    public List<BookDto> getBooksByBorrowedStatus(boolean borrowed) {
        return bookRepository.findAll().stream()
                .filter(b -> b.isBorrowed() == borrowed)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BookDto updateBook(Long id, BookDto dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        if (dto.getBookName()        != null) book.setBookName(dto.getBookName());
        if (dto.getAuthor()          != null) book.setAuthor(dto.getAuthor());
        if (dto.getCategory()        != null) book.setCategory(dto.getCategory());
        if (dto.getTotalCopies()     > 0)     book.setTotalCopies(dto.getTotalCopies());
        if (dto.getAvailableCopies() > 0)     book.setAvailableCopies(dto.getAvailableCopies());
        return convertToDto(bookRepository.save(book));
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    private BookDto convertToDto(Book b) {
        return BookDto.builder()
                .bookId(b.getBookId())
                .bookName(b.getBookName())
                .author(b.getAuthor())
                .category(b.getCategory())
                .availableCopies(b.getAvailableCopies())
                .totalCopies(b.getTotalCopies())
                .borrowed(b.isBorrowed())
                .returned(b.isReturned())
                .build();
    }

    public entireDetails detailsbyUserId(long userId) {
        User user = userRepository.findByUserId(userId);
        List<details> d = borrowRepository.findBooknameAndAuthor(userId);
        return new entireDetails(user, d);
    }
}
