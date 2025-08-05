package com.hotelmanager.chat;

import com.hotelmanager.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Message {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private ChatGroup group;

    @ManyToOne
    private User sender;

    private String content;
    private LocalDateTime timestamp;
}

