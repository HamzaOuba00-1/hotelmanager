package com.hotelmanager.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {
    private Long senderId;
    private String content;

    // Getters & setters
}

