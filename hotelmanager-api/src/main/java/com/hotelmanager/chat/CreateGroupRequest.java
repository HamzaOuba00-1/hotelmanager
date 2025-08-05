package com.hotelmanager.chat;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateGroupRequest {
    private String name;
    private Long creatorId;
    private List<Long> memberIds;

    // Getters & setters
}

