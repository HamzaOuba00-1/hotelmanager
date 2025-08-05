package com.hotelmanager.chat;

import com.hotelmanager.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class ChatGroup {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToOne
    private User createdBy;

    @ManyToMany
    private List<User> members = new ArrayList<>();

    private LocalDateTime createdAt;

}

