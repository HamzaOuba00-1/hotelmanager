
package com.hotelmanager.reservation.controller;

import com.hotelmanager.reservation.controller.ManagerReservationsController.ReservationDto;
import com.hotelmanager.reservation.entity.Reservation;
import com.hotelmanager.reservation.entity.ReservationStatus;
import com.hotelmanager.reservation.repository.ReservationRepository;
import com.hotelmanager.reservation.service.RoomReservationSync;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/client/reservations")
@PreAuthorize("hasRole('CLIENT')")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientReservationsController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final RoomReservationSync sync;

    public ClientReservationsController(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            RoomReservationSync sync
    ) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.sync = sync;
    }

    /**
     * Liste les réservations du client connecté
     */
    @GetMapping
    public ResponseEntity<List<ManagerReservationsController.ReservationDto>> myReservations(
            @AuthenticationPrincipal User principal
    ) {
        // Sécurise un user "fresh"
        User me = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        var rows = reservationRepository.findByClientId(me.getId());

        var dto = rows.stream()
                .map(ManagerReservationsController.ReservationDto::fromEntity)
                .toList();

        return ResponseEntity.ok(dto);
    }

    /**
     * Annulation côté client :
     * - seulement si la réservation lui appartient
     * - seulement si status = PENDING ou CONFIRMED
     * - optionnel : seulement si startAt > now
     */
    @PatchMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<Void> cancelMyReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal
    ) {
        User me = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable"));

        if (res.getClient() == null || !res.getClient().getId().equals(me.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Règles d'annulation
        if (!(res.getStatus() == ReservationStatus.PENDING
                || res.getStatus() == ReservationStatus.CONFIRMED)) {
            return ResponseEntity.badRequest().build();
        }

        // Sécurité temporelle (facultatif mais conseillé)
        OffsetDateTime now = OffsetDateTime.now();
        if (res.getStartAt() != null && !res.getStartAt().isAfter(now)) {
            return ResponseEntity.badRequest().build();
        }

        res.setStatus(ReservationStatus.CANCELED);
        reservationRepository.save(res);

        // Sync état room
        sync.applyStatusToRoom(res);

        return ResponseEntity.noContent().build();
    }
}
