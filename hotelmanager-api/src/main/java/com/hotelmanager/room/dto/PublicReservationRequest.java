package com.hotelmanager.room.dto;

public record PublicReservationRequest(
        Long hotelId,
        Long roomId,
        String firstName,
        String lastName
) {}


