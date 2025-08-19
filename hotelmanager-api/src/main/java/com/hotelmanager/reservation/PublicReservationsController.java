// com/hotelmanager/reservation/PublicReservationsController.java
package com.hotelmanager.reservation;

import com.hotelmanager.reservation.dto.PublicReservationRequest;
import com.hotelmanager.reservation.dto.PublicReservationResponse;
import com.hotelmanager.room.Room;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = "http://localhost:3000")
public class PublicReservationsController {

    private final PublicReservationService service;

    public PublicReservationsController(PublicReservationService service) {
        this.service = service;
    }

    @GetMapping("/hotels/{hotelId}/rooms/available")
    public ResponseEntity<List<Room>> available(
            @PathVariable Long hotelId,
            @RequestParam("start") OffsetDateTime startAt,
            @RequestParam("end") OffsetDateTime endAt
    ) {
        return ResponseEntity.ok(service.listAvailableRooms(hotelId, startAt, endAt));
    }

    @RestController
    @RequestMapping("/api/reservations")
    @PreAuthorize("hasRole('MANAGER')")
    public class ReservationController {
    private final PublicReservationService service;

    public ReservationController(PublicReservationService service) { this.service = service; }

    @PatchMapping("/by-room/{roomId}/cancel")
    public ResponseEntity<Void> cancelByRoom(@PathVariable Long roomId) {
        service.cancelActiveByRoom(roomId);
        return ResponseEntity.noContent().build();
    }
    }

    @PostMapping("/reservations")
    public ResponseEntity<PublicReservationResponse> reserve(@Valid @RequestBody PublicReservationRequest req) {
        PublicReservationResponse resp = service.reserve(
                req.hotelId(), req.roomId(), req.startAt(), req.endAt(),
                req.firstName(), req.lastName()
        );
        return ResponseEntity.status(201).body(resp);
    }
}
