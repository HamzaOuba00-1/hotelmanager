package com.hotelmanager.user.dto;

import com.hotelmanager.user.User;

public record UserShortDto(Long id, String firstName, String lastName, String role) {
  public static UserShortDto from(User u) {
    return new UserShortDto(u.getId(), u.getFirstName(), u.getLastName(), u.getRole().name());
  }
}
