// src/main/java/com/hotelmanager/chat/dto/ChannelUpdateRequest.java
package com.hotelmanager.chat.dto;

public record ChannelUpdateRequest(
  String name,
  String service,
  String icon
) {}
