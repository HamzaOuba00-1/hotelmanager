package com.hotelmanager.attendance.dto;

import java.time.LocalDateTime;

public record CheckOutResponse(Long attendanceId, LocalDateTime checkOutAt) {}
