package com.hotelmanager.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ManualAttendanceRequest {
    private Long employeeId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;                 // ex: 2025-08-08

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkInAt;        // ex: 2025-08-08T08:12:00

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkOutAt;       // optionnel

    /** "PRESENT" | "RETARD" | "ABSENT" */
    private String status;

    /** optionnel (par défaut "MANUAL") */
    private String source;

    /** optionnels */
    private Double lat;
    private Double lng;
}
