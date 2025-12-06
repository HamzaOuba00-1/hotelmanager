package com.hotelmanager.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateRoomRequest(
        @Min(1) int roomNumber,
        @NotBlank String roomType,
        int floor,
        String description,
        boolean active
) {}
