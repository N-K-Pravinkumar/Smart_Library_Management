package com.wecodee.library.management.dto;

import com.wecodee.library.management.model.Book;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibBookDto {
    private Long bookId;
    private String bookName;
    private String author;
    private String category;
    private boolean borrowed;
    private boolean returned;

    private int totalCopies;
    private int availableCopies;

    public static LibBookDto fromEntity(Book book) {
        return new LibBookDto(
                book.getBookId(),
                book.getBookName(),
                book.getAuthor(),
                book.getCategory(),
                book.isBorrowed(),
                book.isReturned(),
                book.getTotalCopies(),
                book.getAvailableCopies()
        );
    }

    public Book toEntity() {
        Book book = new Book();
        book.setBookName(this.bookName);
        book.setAuthor(this.author);
        book.setCategory(this.category);
        book.setBorrowed(this.borrowed);
        book.setReturned(this.returned);
        book.setTotalCopies(this.totalCopies);
        book.setAvailableCopies(this.availableCopies);
        return book;
    }
}
