// src/main/java/com/hotelmanager/chat/dto/MessageSendRequest.java
package com.hotelmanager.chat.dto;
import jakarta.validation.constraints.NotBlank;
public record MessageSendRequest(@NotBlank String content) {}
