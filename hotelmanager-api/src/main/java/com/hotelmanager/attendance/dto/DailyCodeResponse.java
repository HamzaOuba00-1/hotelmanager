package com.hotelmanager.attendance.dto;

import java.time.LocalDateTime;

public record DailyCodeResponse(
    String code,
    LocalDateTime validFrom,  
    LocalDateTime validUntil
) {}
