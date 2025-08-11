package com.hotelmanager.planning;

import com.hotelmanager.planning.dto.ShiftDto;
import com.hotelmanager.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ShiftDto createShift(@Valid @RequestBody Shift shift, @AuthenticationPrincipal User currentUser) {
        shift.setCreatedBy(currentUser); // ✅ ici on fixe le créateur
        Shift created = shiftService.createShift(shift);
        return ShiftDto.from(created);
    }

    @GetMapping("/hotel")
    @PreAuthorize("hasRole('MANAGER')")
    public List<ShiftDto> getShiftsForHotel(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @AuthenticationPrincipal User currentUser
    ) {
        List<Shift> shifts = shiftService.getShiftsForHotel(currentUser.getHotel().getId(), start, end);
        return shifts.stream().map(ShiftDto::from).toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYE')")
    public List<ShiftDto> getMyShifts(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @AuthenticationPrincipal User currentUser
    ) {
        List<Shift> shifts = shiftService.getShiftsForEmployee(currentUser.getId(), start, end);
        return shifts.stream().map(ShiftDto::from).toList();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public void deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
    }
}
