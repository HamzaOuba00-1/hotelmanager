package com.hotelmanager.user.dto;

import com.hotelmanager.user.Role;
import com.hotelmanager.user.User;

public record UserCreatedResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role,
        Long hotelId
) {
    public static UserCreatedResponse from(User user) {
        return new UserCreatedResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getHotel() != null ? user.getHotel().getId() : null
        );
    }
}
