package com.hotelmanager.chat.dto;
import jakarta.validation.constraints.NotBlank;
public record MessageSendRequest(@NotBlank String content) {}
