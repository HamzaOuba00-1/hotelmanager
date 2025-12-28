package com.hotelmanager.user.dto;

import com.hotelmanager.user.entity.User;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String role;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        return dto;
    }
}
