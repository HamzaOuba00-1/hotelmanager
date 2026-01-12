package com.hotelmanager.room.dto;

import com.hotelmanager.room.entity.Room;
import com.hotelmanager.room.entity.RoomState;

import java.time.LocalDateTime;

public record RoomResponse(
        Long id,
        int roomNumber,
        String roomType,
        RoomState roomState,
        int floor,
        String description,
        boolean active,
        LocalDateTime lastUpdated,
        Long clientId,
        Long hotelId
) {
    public static RoomResponse from(Room r) {
        return new RoomResponse(
                r.getId(),
                r.getRoomNumber(),
                r.getRoomType(),
                r.getRoomState(),
                r.getFloor(),
                r.getDescription(),
                r.isActive(),
                r.getLastUpdated(),
                r.getClient() == null ? null : r.getClient().getId(),
                r.getHotel() == null ? null : r.getHotel().getId()
        );
    }
}
