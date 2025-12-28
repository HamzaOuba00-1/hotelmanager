package com.hotelmanager.attendance.controller;

import com.hotelmanager.attendance.dto.AttendanceDto;
import com.hotelmanager.attendance.dto.CheckInRequest;
import com.hotelmanager.attendance.dto.CheckOutResponse;
import com.hotelmanager.attendance.dto.ManualAttendanceRequest;
import com.hotelmanager.attendance.repository.AttendanceRepository;
import com.hotelmanager.attendance.service.AttendanceService;
import com.hotelmanager.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRepository attendanceRepository;

    /**
     * Starts an attendance session (check-in) for the authenticated employee/manager.
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public AttendanceDto checkIn(@Valid @RequestBody CheckInRequest request,
                                 @AuthenticationPrincipal User currentUser) {
        var attendance = attendanceService.checkIn(currentUser, request.code(), request.lat(), request.lng());
        return AttendanceDto.from(attendance);
    }

    /**
     * Closes the currently open attendance session for the authenticated user.
     */
    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public CheckOutResponse checkOut(@AuthenticationPrincipal User currentUser) {
        return attendanceService.checkOut(currentUser);
    }

    /**
     * Lists attendances for the authenticated user's hotel in a given date range (manager only).
     */
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceDto> listForHotel(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
                                           @AuthenticationPrincipal User currentUser) {
        return attendanceRepository
                .findByEmployeeHotelIdAndDateBetween(currentUser.getHotel().getId(), start, end)
                .stream()
                .map(AttendanceDto::from)
                .toList();
    }

    /**
     * Creates a manual attendance record (manager only).
     */
    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public AttendanceDto addManualAttendance(@AuthenticationPrincipal User currentUser,
                                             @Valid @RequestBody ManualAttendanceRequest request) {
        return attendanceService.addManualAttendance(currentUser, request);
    }

    /**
     * Lists attendances for the authenticated user's hotel in a given date range (manager only).
     * This endpoint exists if you want a dedicated URL for date range queries.
     */
    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceDto> listAttendancesByDateRange(@AuthenticationPrincipal User currentUser,
                                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return attendanceService.listAttendances(currentUser, start, end);
    }

    /**
     * Forces a checkout for a specific attendance record (manager only).
     */
    @PatchMapping("/{id}/checkout")
    @PreAuthorize("hasRole('MANAGER')")
    public AttendanceDto forceCheckout(@PathVariable Long id,
                                       @AuthenticationPrincipal User currentUser) {
        return attendanceService.checkoutAttendanceByManager(id, currentUser);
    }

    /**
     * Deletes an attendance record (manager only).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('MANAGER')")
    public void deleteAttendance(@PathVariable Long id,
                                 @AuthenticationPrincipal User currentUser) {
        attendanceService.deleteAttendance(id, currentUser);
    }

    /**
     * Lists the authenticated user's own attendances in a date range.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public List<AttendanceDto> listMine(@AuthenticationPrincipal User currentUser,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return attendanceService.listMine(currentUser, start, end);
    }

    /**
     * Returns the most recent open attendance session for the authenticated user.
     */
    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public AttendanceDto getOpenAttendance(@AuthenticationPrincipal User currentUser) {
        return attendanceRepository
                .findFirstByEmployeeIdAndCheckOutAtIsNullOrderByCheckInAtDesc(currentUser.getId())
                .map(AttendanceDto::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No open attendance session found."));
    }
}
