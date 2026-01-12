package com.hotelmanager.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record PublicReservationRequest(
        @NotNull Long hotelId,
        @NotNull Long roomId,
        @NotNull OffsetDateTime startAt,
        @NotNull OffsetDateTime endAt,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String guestPhone
) {}
