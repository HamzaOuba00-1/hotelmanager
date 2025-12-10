package com.hotelmanager.user.dto;

import jakarta.validation.constraints.Email;

public record UserSelfUpdateRequest(
        String firstName,
        String lastName,
        @Email String email
) {}
