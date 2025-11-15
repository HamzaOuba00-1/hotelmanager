package com.hotelmanager.chat.dto;

public record ChannelUpdateRequest(
  String name,
  String service,
  String icon
) {}
