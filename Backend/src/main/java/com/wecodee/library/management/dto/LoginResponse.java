package com.wecodee.library.management.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private  long id;
    private String username;
}
