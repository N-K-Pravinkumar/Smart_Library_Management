package com.wecodee.library.management.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookDto {
    private Long bookId;
    private String bookName;
    private String author;
    private String category;
    private int availableCopies;
    private int totalCopies;
    private boolean borrowed;
    private boolean returned;
}
