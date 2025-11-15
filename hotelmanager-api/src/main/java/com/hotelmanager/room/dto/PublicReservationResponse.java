package com.hotelmanager.room.dto;

public record PublicReservationResponse(
        Long roomId,
        String email,
        String generatedPassword 
) {}