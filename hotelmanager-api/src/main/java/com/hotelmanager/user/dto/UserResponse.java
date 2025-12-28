package com.hotelmanager.user.dto;

import com.hotelmanager.user.entity.Role;
import com.hotelmanager.user.entity.User;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    Role role,
    Long hotelId,
    String generatedPassword
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getRole(),
            user.getHotel() != null ? user.getHotel().getId() : null,
            null
        );
    }

    public static UserResponse from(User user, String generatedPassword) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getRole(),
            user.getHotel() != null ? user.getHotel().getId() : null,
            generatedPassword
        );
    }
}

