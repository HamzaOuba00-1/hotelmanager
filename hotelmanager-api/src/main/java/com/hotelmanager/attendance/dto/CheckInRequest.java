// src/main/java/com/hotelmanager/attendance/dto/CheckInRequest.java
package com.hotelmanager.attendance.dto;

import jakarta.validation.constraints.Pattern;

public record CheckInRequest(
    @Pattern(regexp = "^[A-Z0-9]{6,12}$")
    String code,
    Double lat,
    Double lng
) {}
