package com.hotelmanager.attendance.controller;

import com.hotelmanager.attendance.dto.DailyCodeResponse;
import com.hotelmanager.attendance.service.DailyCodeService;
import com.hotelmanager.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@RestController
@RequestMapping("/api/attendance/codes")
@RequiredArgsConstructor
public class DailyCodeController {

    private final DailyCodeService dailyCodeService;

    /**
     * Regenerates a new daily attendance code for the authenticated manager's hotel.
     * The generated code is valid for a fixed duration.
     */
    @PostMapping("/regenerate")
    @PreAuthorize("hasRole('MANAGER')")
    public DailyCodeResponse regenerate(@AuthenticationPrincipal User currentUser) {

        if (currentUser.getHotel() == null || currentUser.getHotel().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Authenticated user is not associated with a hotel."
            );
        }

        var dailyCode = dailyCodeService.regenerate(currentUser, Duration.ofHours(6));

        return new DailyCodeResponse(
                dailyCode.getCode(),
                dailyCode.getValidFrom(),
                dailyCode.getValidUntil()
        );
    }

    /**
     * Returns the currently active daily attendance code for the user's hotel.
     */
    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('MANAGER','EMPLOYE')")
    public DailyCodeResponse getCurrent(@AuthenticationPrincipal User currentUser) {

        if (currentUser.getHotel() == null || currentUser.getHotel().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Authenticated user is not associated with a hotel."
            );
        }

        var dailyCode = dailyCodeService
                .current(currentUser.getHotel().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No active daily code found."
                ));

        return new DailyCodeResponse(
                dailyCode.getCode(),
                dailyCode.getValidFrom(),
                dailyCode.getValidUntil()
        );
    }
}
