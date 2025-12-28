package com.hotelmanager.reservation.controller;

import com.hotelmanager.reservation.dto.PublicReservationRequest;
import com.hotelmanager.reservation.dto.PublicReservationResponse;
import com.hotelmanager.reservation.service.PublicReservationService;
import com.hotelmanager.room.entity.Room;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startAt,
            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endAt
    ) {
        return ResponseEntity.ok(service.listAvailableRooms(hotelId, startAt, endAt));
    }

    @PostMapping("/reservations")
    public ResponseEntity<PublicReservationResponse> reserve(
            @Valid @RequestBody PublicReservationRequest req) {
        PublicReservationResponse resp = service.reserve(
                req.hotelId(),
                req.roomId(),
                req.startAt(),
                req.endAt(),
                req.firstName(),
                req.lastName(),
                req.guestPhone() 
        );
        return ResponseEntity.status(201).body(resp);
    }

}
