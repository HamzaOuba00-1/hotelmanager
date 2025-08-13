// src/main/java/com/hotelmanager/chat/dto/MessageResponse.java
package com.hotelmanager.chat.dto;

import com.hotelmanager.chat.entity.Message;

public record MessageResponse(
  Long id,
  Long channelId,
  Long senderId,
  String senderFirstName,   // ✅ NEW
  String senderLastName,    // ✅ NEW
  String type,
  String content,
  String createdAt,
  String editedAt,
  boolean softDeleted
){
  public static MessageResponse from(Message m) {
    return new MessageResponse(
      m.getId(),
      m.getChannel().getId(),
      m.getSender().getId(),
      m.getSender().getFirstName(),            // ✅
      m.getSender().getLastName(),             // ✅
      m.getType().name(),
      m.isSoftDeleted() ? "" : m.getContent(),
      m.getCreatedAt().toString(),
      m.getEditedAt() != null ? m.getEditedAt().toString() : null,
      m.isSoftDeleted()
    );
  }
}
