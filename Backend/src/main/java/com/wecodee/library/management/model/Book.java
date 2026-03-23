package com.wecodee.library.management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    @Column(nullable = false)
    private String bookName;

    @Column(nullable = false)
    private String author;

    private String category;

    @Column( nullable = false)
    private int totalCopies;

    @Column(nullable = false)
    private int availableCopies;

    @Column(name = "IS_BORROWED")
    private boolean borrowed;

    @Column(name = "IS_RETURNED")
    private boolean returned;

}
