package com.hotelmanager.room.dto;

public record PublicReservationResponse(
        Long roomId,
        String email,
        String generatedPassword // renvoyé une seule fois à l’écran
) {}