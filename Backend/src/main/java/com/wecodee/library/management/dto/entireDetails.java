package com.wecodee.library.management.dto;

import com.wecodee.library.management.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class entireDetails {
    private User user;
    private List<details> details;
}
