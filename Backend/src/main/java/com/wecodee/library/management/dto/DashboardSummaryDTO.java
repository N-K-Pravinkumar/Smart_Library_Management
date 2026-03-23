// src/main/java/com/wecodee/library/management/dto/DashboardSummaryDTO.java
package com.wecodee.library.management.dto;

import lombok.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private long totalBooks;
    private long totalMembers;
    private long totalBorrowed;
    private long totalReturned;
    private long totalNotReturned;
    private double totalFine;
}
