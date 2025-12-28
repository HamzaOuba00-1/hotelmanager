package com.hotelmanager.attendance.dto;

import com.hotelmanager.attendance.entity.Attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object representing an attendance record.
 * Used to expose attendance data through the API without leaking entity internals.
 */
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

    /**
     * Maps an Attendance entity to its DTO representation.
     */
    public static AttendanceDto from(Attendance attendance) {
        var employee = attendance.getEmployee();

        return new AttendanceDto(
                attendance.getId(),
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                attendance.getDate(),
                attendance.getCheckInAt(),
                attendance.getCheckOutAt(),
                attendance.getStatus().name(),
                attendance.getSource()
        );
    }
}
