package com.hotelmanager.attendance.dto;

import com.hotelmanager.attendance.Attendance;
import java.time.*;

public record AttendanceDto(
    Long id,
    Long employeeId,
    String firstName,
    String lastName,
    LocalDate date,
    LocalDateTime checkInAt,
    LocalDateTime checkOutAt,
    String status,
    String source
) {
    public static AttendanceDto from(Attendance a) {
        var u = a.getEmployee();
        return new AttendanceDto(
            a.getId(),
            u.getId(),
            u.getFirstName(),
            u.getLastName(),
            a.getDate(),
            a.getCheckInAt(),
            a.getCheckOutAt(),
            a.getStatus().name(),
            a.getSource()
        );
    }
}
