package com.wecodee.library.management.repository;

import com.wecodee.library.management.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("SELECT SUM(b.totalCopies) FROM Book b")
    Long getTotalAvailableBooks();

    Book findByBookId(Long bookId);
}
