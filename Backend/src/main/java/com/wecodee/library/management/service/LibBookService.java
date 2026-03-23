package com.wecodee.library.management.service;

import com.wecodee.library.management.dto.LibBookDto;
import com.wecodee.library.management.model.Book;
import com.wecodee.library.management.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibBookService {

    private final BookRepository bookRepository;

    public LibBookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<LibBookDto> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(LibBookDto::fromEntity)
                .collect(Collectors.toList());
    }

    public LibBookDto addBook(LibBookDto dto) {
        Book book = dto.toEntity();
        book.setAvailableCopies(dto.getTotalCopies());
        bookRepository.save(book);
        return LibBookDto.fromEntity(book);
    }

    public LibBookDto updateBook(Long bookId, LibBookDto dto) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setBookName(dto.getBookName());
        book.setAuthor(dto.getAuthor());
        book.setCategory(dto.getCategory());
        book.setBorrowed(dto.isBorrowed());
        book.setReturned(dto.isReturned());
        book.setTotalCopies(dto.getTotalCopies());

        if (dto.getAvailableCopies() <= dto.getTotalCopies()) {
            book.setAvailableCopies(dto.getAvailableCopies());
        } else {
            book.setAvailableCopies(dto.getTotalCopies());
        }

        book.setBorrowed(book.getAvailableCopies() == 0);
        bookRepository.save(book);
        return LibBookDto.fromEntity(book);
    }

    public void deleteBook(Long bookId) {
        bookRepository.deleteById(bookId);
    }

    public LibBookDto getBookById(Long bookId) {
        return bookRepository.findById(bookId)
                .map(LibBookDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }
}
