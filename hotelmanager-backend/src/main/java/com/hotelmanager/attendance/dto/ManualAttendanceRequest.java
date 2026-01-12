package com.hotelmanager.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Request payload used by a manager to manually create or adjust
 * an attendance record for an employee.
 *
 * This is typically used for corrections, exceptions, or missed check-ins.
 */
public class ManualAttendanceRequest {

    /**
     * Identifier of the employee concerned by the attendance record.
     */
    @NotNull
    private Long employeeId;

    /**
     * Attendance date (hotel local date).
     */
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /**
     * Manual check-in timestamp.
     * Can be null if the employee never checked in.
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkInAt;

    /**
     * Manual check-out timestamp.
     * Can be null if the employee never checked out.
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkOutAt;

    /**
     * Attendance status (e.g. PRESENT, ABSENT, LATE).
     * Validation is enforced at service level.
     */
    @NotBlank
    private String status;

    /**
     * Source of the attendance record.
     * Example values: MANUAL, SYSTEM, CORRECTION.
     */
    @NotBlank
    private String source;

    /**
     * Optional latitude where the attendance was registered.
     */
    private Double lat;

    /**
     * Optional longitude where the attendance was registered.
     */
    private Double lng;

    /* ===== Getters & Setters ===== */

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getCheckInAt() {
        return checkInAt;
    }

    public void setCheckInAt(LocalDateTime checkInAt) {
        this.checkInAt = checkInAt;
    }

    public LocalDateTime getCheckOutAt() {
        return checkOutAt;
    }

    public void setCheckOutAt(LocalDateTime checkOutAt) {
        this.checkOutAt = checkOutAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }
}
