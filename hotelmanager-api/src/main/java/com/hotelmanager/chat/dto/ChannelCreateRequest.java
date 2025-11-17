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
  Long crewId,                
  List<Long> memberIds        
) {}
