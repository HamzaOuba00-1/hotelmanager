package com.hotelmanager.room;

import com.hotelmanager.common.BusinessRuleException;
import com.hotelmanager.common.NotFoundException;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static com.hotelmanager.room.RoomState.*;

/**
 * Service métier des chambres :
 * - Génération/suppression par hôtel
 * - CRUD
 * - Transitions d'état autorisées (FSM)
 * - Règles de suppression
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Room findMyRoom() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié.");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable: " + email));

        return roomRepository.findFirstByClientId(user.getId())
                .orElseThrow(() -> new NotFoundException("Aucune chambre associée à l'utilisateur."));
    }

    /** Graph de transitions autorisées (FSM) */
    private static final Map<RoomState, Set<RoomState>> ALLOWED = Map.ofEntries(
            Map.entry(LIBRE, Set.of(RESERVEE, CHECKIN, MAINTENANCE, INACTIVE)),
            Map.entry(RESERVEE, Set.of(CHECKIN, A_VALIDER_LIBRE, LIBRE)),
            Map.entry(CHECKIN, Set.of(ROOM_SERVICE, CHECKOUT)),
            Map.entry(CHECKOUT, Set.of(A_VALIDER_LIBRE, A_NETTOYER)),
            Map.entry(A_NETTOYER, Set.of(EN_NETTOYAGE)),
            Map.entry(EN_NETTOYAGE, Set.of(A_VALIDER_CLEAN)),
            Map.entry(A_VALIDER_CLEAN, Set.of(LIBRE, A_NETTOYER)),
            Map.entry(ROOM_SERVICE, Set.of(CHECKIN, CHECKOUT)),
            Map.entry(A_VALIDER_LIBRE, Set.of(CHECKIN, A_NETTOYER)),
            Map.entry(MAINTENANCE, Set.of(LIBRE)),
            Map.entry(INACTIVE, Set.of(LIBRE))
    );

    private static final Set<RoomState> DELETABLE = Set.of(LIBRE);

    /* ======================= Génération / Nettoyage par hôtel ======================= */

    public void generateRoomsForHotel(Hotel hotel) {
        if (hotel == null || hotel.getFloors() == null || hotel.getRoomsPerFloor() == null) return;

        deleteRoomsForHotel(hotel);

        List<Room> roomsToSave = new ArrayList<>();

        for (int floorIndex = 0; floorIndex < hotel.getFloors(); floorIndex++) {
            String floorLabel = (hotel.getFloorLabels() != null && hotel.getFloorLabels().size() > floorIndex)
                    ? hotel.getFloorLabels().get(floorIndex)
                    : String.valueOf(floorIndex);

            for (int roomNumber = 1; roomNumber <= hotel.getRoomsPerFloor(); roomNumber++) {
                Room room = new Room();
                room.setHotel(hotel);
                room.setFloor(floorIndex); // index numérique
                int number = Integer.parseInt(String.format("%d%02d", floorIndex, roomNumber));
                room.setRoomNumber(number);
                String type = (hotel.getRoomTypes() != null && !hotel.getRoomTypes().isEmpty())
                        ? hotel.getRoomTypes().get(0) : "Standard";
                room.setRoomType(type);
                room.setRoomState(LIBRE);
                room.setDescription("Chambre " + number + " - " + floorLabel);
                room.setActive(true);
                room.setLastUpdated(LocalDateTime.now());
                roomsToSave.add(room);
            }
        }

        roomRepository.saveAll(roomsToSave);
    }

    public void deleteRoomsForHotel(Hotel hotel) {
        if (hotel == null || hotel.getId() == null) return;
        List<Room> existing = roomRepository.findByHotelId(hotel.getId());
        roomRepository.deleteAll(existing);
    }


    public Room create(Room room) {
        Hotel hotel = resolveCurrentUserHotel();
        room.setHotel(hotel);
        if (room.getRoomState() == null) room.setRoomState(LIBRE);
        room.setActive(true);
        room.setLastUpdated(LocalDateTime.now());

        if (roomRepository.existsByHotelIdAndRoomNumber(hotel.getId(), room.getRoomNumber())) {
            throw new BusinessRuleException("Numéro de chambre déjà utilisé dans cet hôtel.");
        }
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room update(Long id, Room updatedRoom) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chambre non trouvée: " + id));

        existing.setRoomNumber(updatedRoom.getRoomNumber());
        existing.setRoomType(updatedRoom.getRoomType());
        existing.setFloor(updatedRoom.getFloor());
        existing.setDescription(updatedRoom.getDescription());
        existing.setActive(updatedRoom.isActive());
        existing.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(existing);
    }

    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chambre non trouvée: " + id));
        if (!DELETABLE.contains(room.getRoomState())) {
            throw new BusinessRuleException("Suppression impossible: l'état actuel est " + room.getRoomState());
        }
        roomRepository.deleteById(id);
    }

    /* =============================== Changement d'état =============================== */

    public Room updateState(Long id, String newStateRaw) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chambre non trouvée: " + id));

        RoomState target = RoomState.parse(newStateRaw);
        RoomState current = room.getRoomState();

        if (!ALLOWED.getOrDefault(current, Set.of()).contains(target)) {
            throw new BusinessRuleException("Transition non autorisée: " + current + " -> " + target);
        }

        room.setRoomState(target);
        room.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(room);
    }

    public Room updateState(Long id, RoomState target) {
        return updateState(id, target.name());
    }

    /* ================================== Helpers ================================== */

    /** Récupère l'hôtel associé à l'utilisateur courant via Spring Security */
    private Hotel resolveCurrentUserHotel() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié.");
        }
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable: " + email));

        Hotel hotel = user.getHotel();
        if (hotel == null) {
            throw new IllegalArgumentException("Aucun hôtel associé à l'utilisateur.");
        }
        return hotel;
    }

    public Set<RoomState> allowedTargets(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new NotFoundException("Chambre non trouvée: " + roomId));
        return ALLOWED.getOrDefault(room.getRoomState(), Set.of());
    }
}
