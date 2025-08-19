// src/main/java/com/hotelmanager/attendance/DailyCodeController.java
package com.hotelmanager.attendance;

import com.hotelmanager.attendance.dto.DailyCodeResponse;
import com.hotelmanager.user.User;
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

  private final DailyCodeService service;

  @PostMapping("/regenerate")
  @PreAuthorize("hasRole('MANAGER')")
  public DailyCodeResponse regenerate(@AuthenticationPrincipal User current) {
    var hotel = current.getHotel();
    if (hotel == null || hotel.getId() == null)
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Utilisateur sans hôtel (principal incomplet)");

    var dc = service.regenerate(current, Duration.ofHours(6));
    return new DailyCodeResponse(dc.getCode(), dc.getValidFrom(), dc.getValidUntil()); // ✅ 3 args
  }

  @GetMapping("/current")
  @PreAuthorize("hasAnyRole('MANAGER','EMPLOYE')")
  public DailyCodeResponse current(@AuthenticationPrincipal User current) {
    var hotel = current.getHotel();
    if (hotel == null || hotel.getId() == null)
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Utilisateur sans hôtel (principal incomplet)");

    var dc = service.current(hotel.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pas de code actif"));
    return new DailyCodeResponse(dc.getCode(), dc.getValidFrom(), dc.getValidUntil()); // ✅ 3 args
  }
}
