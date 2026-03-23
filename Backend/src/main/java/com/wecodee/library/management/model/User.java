package com.wecodee.library.management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name="Users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long userId;

    @Column(nullable = false,unique = true)
    private String userName;

    private  long  phoneNumber;


    private String role="Librarian";

    @Column(nullable = false,unique = true)
    private  String email;

    private  String password;

}
