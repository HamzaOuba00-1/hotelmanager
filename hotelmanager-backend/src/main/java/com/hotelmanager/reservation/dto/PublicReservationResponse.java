package com.hotelmanager.reservation.dto;

public record PublicReservationResponse(
        Long reservationId,
        String email,
        String generatedPassword
        
) {}
