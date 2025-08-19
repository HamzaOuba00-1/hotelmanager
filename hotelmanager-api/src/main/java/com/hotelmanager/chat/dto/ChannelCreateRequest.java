// src/main/java/com/hotelmanager/chat/dto/ChannelCreateRequest.java
package com.hotelmanager.chat.dto;

import com.hotelmanager.chat.model.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ChannelCreateRequest(
  @NotNull ChannelType type,
  @NotBlank String name,
  String service,
  String icon,
  Long crewId,                // requis si type=CREW
  List<Long> memberIds        // requis si type=DIRECT (2 ids) ou channel custom
) {}
