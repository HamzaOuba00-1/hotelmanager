package com.hotelmanager.reservation;

import com.hotelmanager.common.BusinessRuleException;
import com.hotelmanager.common.NotFoundException;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.room.Room;
import com.hotelmanager.room.RoomRepository;
import com.hotelmanager.room.RoomState;
import com.hotelmanager.user.Role;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PublicReservationService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomReservationSync sync; // ✅ injection de la synchro Room ⇄ Reservation

    @Transactional(readOnly = true)
    public List<Room> listAvailableRooms(Long hotelId, OffsetDateTime startAt, OffsetDateTime endAt) {
        if (startAt == null || endAt == null || !startAt.isBefore(endAt)) {
            throw new BusinessRuleException("Intervalle de dates invalide.");
        }
        // ✅ On ne renvoie QUE les chambres dont le state actuel est LIBRE,
        //    ET qui n'ont pas de réservation active qui chevauche l'intervalle.
        return roomRepository.findAvailableRoomsStrictlyLibre(hotelId, startAt, endAt);
    }

    @Transactional
    public void cancelActiveByRoom(Long roomId) {
        var now = OffsetDateTime.now();
        var actives = reservationRepository.findActiveFutureByRoom(roomId, now);
        if (actives.isEmpty()) return;

        // Annule toutes les résas "actives/futures"
        for (var res : actives) {
            res.setStatus(ReservationStatus.CANCELED);
        }
        reservationRepository.saveAll(actives);

        // Libère la chambre si elle était simplement réservée
        var room = actives.get(0).getRoom();
        if (room.getRoomState() == RoomState.RESERVEE) {
            room.setRoomState(RoomState.LIBRE);
            room.setClient(null);
            roomRepository.save(room);
        }
    }

    @Transactional
    public com.hotelmanager.reservation.dto.PublicReservationResponse reserve(
            Long hotelId, Long roomId, OffsetDateTime startAt, OffsetDateTime endAt,
            String firstName, String lastName) {

        if (startAt == null || endAt == null || !startAt.isBefore(endAt)) {
            throw new BusinessRuleException("Intervalle de dates invalide.");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Chambre introuvable."));
        Hotel hotel = room.getHotel();
        if (hotel == null || !hotel.getId().equals(hotelId)) {
            throw new BusinessRuleException("Cette chambre n’appartient pas à l’hôtel demandé.");
        }
        if (!room.isActive() || room.getRoomState() == RoomState.INACTIVE) {
            throw new BusinessRuleException("Chambre indisponible.");
        }

        // Check applicatif (la DB protège aussi via contraintes)
        boolean overlaps = reservationRepository.existsOverlapping(roomId, startAt, endAt);
        if (overlaps) {
            throw new BusinessRuleException("Cette chambre est déjà réservée sur l’intervalle.");
        }

        // Créer le compte client
        String hotelSlug = slugify(hotel.getName());
        String email = ensureUniqueEmail(buildEmail(firstName, lastName, hotelSlug));
        String rawPassword = generatePassword(firstName, lastName);
        String encoded = passwordEncoder.encode(rawPassword);

        User client = new User();
        client.setFirstName(cap(firstName));
        client.setLastName(cap(lastName));
        client.setEmail(email);
        client.setPassword(encoded);
        client.setRole(Role.CLIENT);
        client.setHotel(hotel);
        client.setEnabled(true);
        client = userRepository.save(client);

        // Créer la réservation
        Reservation res = new Reservation();
        res.setHotel(hotel);
        res.setRoom(room);
        res.setClient(client);
        res.setGuestFirstName(cap(firstName));
        res.setGuestLastName(cap(lastName));
        res.setStartAt(startAt);
        res.setEndAt(endAt);
        res.setStatus(ReservationStatus.CONFIRMED);

        try {
            res = reservationRepository.save(res);
            // ✅ UNE SEULE source de vérité : on synchronise l’état de la chambre ici.
            sync.applyStatusToRoom(res);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessRuleException("Conflit : créneau déjà pris pour cette chambre.");
        }

        // ❌ NE PAS refaire un setState manuel ici (déjà géré par sync.applyStatusToRoom)

        return new com.hotelmanager.reservation.dto.PublicReservationResponse(
                res.getId(), email, rawPassword
        );
    }

    /* ========= Helpers ========= */

    private static String slugify(String s) {
        if (s == null) return "hotel";
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private static String cap(String s) {
        if (s == null || s.isBlank()) return s;
        String t = s.trim().toLowerCase(Locale.ROOT);
        return Character.toUpperCase(t.charAt(0)) + t.substring(1);
    }

    private String ensureUniqueEmail(String base) {
        String email = base;
        int i = 1;
        while (userRepository.existsByEmail(email)) {
            i++;
            int at = base.indexOf('@');
            email = base.substring(0, at) + i + base.substring(at);
        }
        return email;
    }

    private static String buildEmail(String firstName, String lastName, String hotelSlug) {
        String fn = slugify(firstName == null ? "" : firstName).replace("-", "");
        String ln = slugify(lastName == null ? "" : lastName).replace("-", "");
        if (fn.isEmpty()) fn = "client";
        if (ln.isEmpty()) ln = "x";
        return fn + "." + ln + "@" + hotelSlug + ".hotel";
    }

    private static String generatePassword(String firstName, String lastName) {
        SecureRandom r = new SecureRandom();
        String base = (cap(firstName) + cap(lastName)).replaceAll("\\s+", "");
        if (base.length() < 4) base = "ClientHotel";
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        String[] symbols = {"!", "#", "$", "%", "?"};
        String sym = symbols[r.nextInt(symbols.length)];
        String pw = base.substring(0, Math.min(4, base.length())) + sb + sym;
        return pw.length() < 12 ? pw + "1234" : pw;
    }
}
