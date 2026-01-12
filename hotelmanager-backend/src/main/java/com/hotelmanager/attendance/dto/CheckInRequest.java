package com.hotelmanager.attendance.dto;

import jakarta.validation.constraints.Pattern;

/**
 * Request payload used when an employee performs a check-in.
 * Contains the daily validation code and optional geolocation data.
 */
public record CheckInRequest(

        /**
         * Daily attendance code.
         * Must be alphanumeric and between 6 and 12 characters.
         */
        @Pattern(
                regexp = "^[A-Z0-9]{6,12}$",
                message = "Code must be alphanumeric and contain 6 to 12 uppercase characters"
        )
        String code,

        /**
         * Latitude of the employee at check-in time.
         * Can be null if geolocation is not provided.
         */
        Double lat,

        /**
         * Longitude of the employee at check-in time.
         * Can be null if geolocation is not provided.
         */
        Double lng
) {}
