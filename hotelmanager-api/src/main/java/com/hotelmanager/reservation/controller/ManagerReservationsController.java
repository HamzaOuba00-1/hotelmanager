package com.hotelmanager.reservation.controller;

import com.hotelmanager.reservation.entity.Reservation;
import com.hotelmanager.reservation.entity.ReservationStatus;
import com.hotelmanager.reservation.repository.ReservationRepository;
import com.hotelmanager.reservation.service.PublicReservationService;
import com.hotelmanager.reservation.service.RoomReservationSync;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@PreAuthorize("hasRole('MANAGER')")
@CrossOrigin(origins = "http://localhost:3000")
public class ManagerReservationsController {

    private final PublicReservationService service;
    private final ReservationRepository reservationRepository;
    private final RoomReservationSync sync;
    private final UserRepository userRepository;

    public ManagerReservationsController(
            PublicReservationService service,
            ReservationRepository reservationRepository,
            RoomReservationSync sync,
            UserRepository userRepository
    ) {
        this.service = service;
        this.reservationRepository = reservationRepository;
        this.sync = sync;
        this.userRepository = userRepository;
    }

    private Long currentHotelId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (u.getHotel() == null) throw new RuntimeException("Aucun hôtel associé");
        return u.getHotel().getId();
    }

    @GetMapping
    public ResponseEntity<List<ReservationDto>> listReservations() {
        var hotelId = currentHotelId();
        var all = reservationRepository.findByHotelId(hotelId);
        return ResponseEntity.ok(all.stream().map(ReservationDto::fromEntity).toList());
    }

    @GetMapping("/{id}/allowed-status")
    public ResponseEntity<List<ReservationStatus>> allowedStatuses(@PathVariable Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));
        return ResponseEntity.ok(getAllowedTransitions(res.getStatus()));
    }

    @PatchMapping("/by-room/{roomId}/cancel")
    public ResponseEntity<Void> cancelByRoom(@PathVariable Long roomId) {
        service.cancelActiveByRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Void> updateStatus(@PathVariable Long id,
                                             @Valid @RequestBody UpdateStatusRequest req) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        var allowed = getAllowedTransitions(res.getStatus());
        if (!allowed.contains(req.status())) {
            return ResponseEntity.badRequest().build();
        }

        res.setStatus(req.status());
        reservationRepository.save(res);
        sync.applyStatusToRoom(res);

        return ResponseEntity.noContent().build();
    }

    private List<ReservationStatus> getAllowedTransitions(ReservationStatus current) {
        return switch (current) {
            case PENDING   -> List.of(ReservationStatus.CONFIRMED, ReservationStatus.CANCELED);
            case CONFIRMED -> List.of(ReservationStatus.CHECKED_IN, ReservationStatus.NO_SHOW, ReservationStatus.CANCELED);
            case CHECKED_IN-> List.of(ReservationStatus.COMPLETED);
            case NO_SHOW   -> List.of(ReservationStatus.CANCELED);
            default        -> List.of();
        };
    }

    public record ReservationDto(
            Long id,
            RoomLite room,
            UserLite client,
            String guestFirstName,
            String guestLastName,
            String guestPhone,
            OffsetDateTime startAt,
            OffsetDateTime endAt,
            ReservationStatus status,
            Long version
    ) {
        public static ReservationDto fromEntity(Reservation r) {
            return new ReservationDto(
                    r.getId(),
                    r.getRoom() == null ? null : new RoomLite(
                            r.getRoom().getId(),
                            r.getRoom().getRoomNumber(),
                            r.getRoom().getRoomType(),
                            r.getRoom().getFloor()
                    ),
                    r.getClient() == null ? null : new UserLite(
                            r.getClient().getId(),
                            r.getClient().getFirstName(),
                            r.getClient().getLastName(),
                            r.getClient().getEmail(),
                            null
                    ),
                    r.getGuestFirstName(),
                    r.getGuestLastName(),
                    r.getGuestPhone(),  
                    r.getStartAt(),
                    r.getEndAt(),
                    r.getStatus(),
                    r.getVersion()
            );
        }
    }

    public record RoomLite(Long id, Integer roomNumber, String roomType, Integer floor) {}
    public record UserLite(Long id, String firstName, String lastName, String email, String phone) {}
    public record UpdateStatusRequest(ReservationStatus status) {}
}
