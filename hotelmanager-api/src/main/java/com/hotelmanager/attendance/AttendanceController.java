// src/main/java/com/hotelmanager/attendance/AttendanceController.java
package com.hotelmanager.attendance;

import com.hotelmanager.attendance.dto.*;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService service;
    private final AttendanceRepository repo;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceService attendanceService;


    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public AttendanceDto checkIn(@Valid @RequestBody CheckInRequest req,
            @AuthenticationPrincipal User current) {
        var att = service.checkIn(current, req.code(), req.lat(), req.lng());
        return AttendanceDto.from(att);
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public CheckOutResponse checkOut(@AuthenticationPrincipal User current) {
        return service.checkOut(current);
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceDto> list(@RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @AuthenticationPrincipal User current) {
        return repo.findByEmployeeHotelIdAndDateBetween(current.getHotel().getId(), start, end)
                .stream().map(AttendanceDto::from).toList();
    }

    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public AttendanceDto addManualAttendance(@AuthenticationPrincipal User current,
                                             @RequestBody ManualAttendanceRequest req) {
        return attendanceService.addManualAttendance(current, req);
    }

    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceDto> listAttendances(
            @AuthenticationPrincipal User current,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end)
        {
        return attendanceService.listAttendances(current, start, end);
    }

    @PatchMapping("/{id}/checkout")
    @PreAuthorize("hasRole('MANAGER')")
    public AttendanceDto checkoutAttendanceByManager(
            @PathVariable Long id,
            @AuthenticationPrincipal User current) {
        return attendanceService.checkoutAttendanceByManager(id, current);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAttendance(
            @PathVariable Long id,
            @AuthenticationPrincipal User current) {
        attendanceService.deleteAttendance(id, current);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public List<AttendanceDto> listMine(
            @AuthenticationPrincipal User current,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return service.listMine(current, start, end);
    }

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public AttendanceDto getOpen(@AuthenticationPrincipal User current) {
        return repo.findFirstByEmployeeIdAndCheckOutAtIsNullOrderByCheckInAtDesc(current.getId())
                .map(AttendanceDto::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun pointage ouvert"));
    }
   
}
