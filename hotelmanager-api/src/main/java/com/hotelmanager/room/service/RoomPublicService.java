package com.hotelmanager.room.service;

import com.hotelmanager.common.exception.BusinessRuleException;
import com.hotelmanager.common.exception.NotFoundException;
import com.hotelmanager.hotel.entity.Hotel;
import com.hotelmanager.room.entity.Room;
import com.hotelmanager.room.repository.RoomRepository;
import com.hotelmanager.user.entity.Role;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.hotelmanager.room.entity.RoomState.LIBRE;
import static com.hotelmanager.room.entity.RoomState.RESERVEE;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RoomPublicService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public java.util.List<Room> listAvailableRooms(Long hotelId) {
        return roomRepository.findByHotelIdAndActiveTrueAndRoomState(hotelId, LIBRE);
    }

    @Transactional
    public com.hotelmanager.reservation.dto.PublicReservationResponse reserve(
            Long hotelId, Long roomId, String firstName, String lastName) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Chambre introuvable"));

        Hotel hotel = room.getHotel();
        if (hotel == null || !hotel.getId().equals(hotelId)) {
            throw new BusinessRuleException("Cette chambre n’appartient pas à l’hôtel demandé.");
        }
        if (!room.isActive() || room.getRoomState() != LIBRE) {
            throw new BusinessRuleException("Chambre non disponible.");
        }

        String email = buildEmail(firstName, lastName, slugify(hotel.getName()));
        email = ensureUniqueEmail(email);
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

        room.setClient(client);
        room.setRoomState(RESERVEE);
        roomRepository.save(room);

        return new com.hotelmanager.reservation.dto.PublicReservationResponse(room.getId(), email, rawPassword);
    }

    /* ===== helpers ===== */
    private static String slugify(String s) {
        if (s == null) return "hotel";
        String n = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return n.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
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

    /** Génère un mot de passe simple à mémoriser mais robuste (≥12) */
    private static String generatePassword(String firstName, String lastName) {
        SecureRandom r = new SecureRandom();
        String base = (cap(firstName) + cap(lastName)).replaceAll("\\s+", "");
        if (base.length() < 4) base = "ClientHotel";
        // 8 alphanum pseudo-aléatoires + 1 symbole pour entropie
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        String[] symbols = {"!", "#", "$", "%", "?"};
        String sym = symbols[r.nextInt(symbols.length)];
        String pw = base.substring(0, Math.min(4, base.length())) + sb + sym;
        return pw.length() < 12 ? pw + "1234" : pw;
    }
}
