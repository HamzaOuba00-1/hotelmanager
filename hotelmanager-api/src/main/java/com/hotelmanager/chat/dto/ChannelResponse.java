// src/main/java/com/hotelmanager/chat/dto/ChannelResponse.java
package com.hotelmanager.chat.dto;

import com.hotelmanager.chat.entity.Channel;

public record ChannelResponse(
  Long id, String name, String type, String service, String icon,
  Long hotelId, Long crewId, Long createdBy, String createdAt, int memberCount
){
  public static ChannelResponse from(Channel c, int memberCount) {
    return new ChannelResponse(
      c.getId(), c.getName(), c.getType().name(), c.getService(), c.getIcon(),
      c.getHotel().getId(),
      c.getCrew()!=null ? c.getCrew().getId() : null,
      c.getCreatedBy()!=null ? c.getCreatedBy().getId() : null,
      c.getCreatedAt().toString(),
      memberCount
    );
  }
}
