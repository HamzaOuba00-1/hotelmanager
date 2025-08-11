// src/main/java/com/hotelmanager/attendance/dto/DailyCodeResponse.java
package com.hotelmanager.attendance.dto;

import java.time.LocalDateTime;

public record DailyCodeResponse(
    String code,
    LocalDateTime validFrom,   // 👈 ajouté
    LocalDateTime validUntil
) {}
