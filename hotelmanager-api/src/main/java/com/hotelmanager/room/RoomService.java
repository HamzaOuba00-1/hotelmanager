package com.hotelmanager.room;

import com.hotelmanager.common.BusinessRuleException;
import com.hotelmanager.common.NotFoundException;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.reservation.ReservationStatus;
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

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    /** FSM transitions "manuelles" (UI staff) */
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
            Map.entry(INACTIVE, Set.of(LIBRE)));

    private static final Set<RoomState> DELETABLE = Set.of(LIBRE);

    /* =================== Current hotel resolution =================== */

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié.");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable: " + email));
    }

    private Hotel currentHotel() {
        Hotel hotel = currentUser().getHotel();
        if (hotel == null || hotel.getId() == null) {
            throw new IllegalArgumentException("Aucun hôtel associé à l'utilisateur.");
        }
        return hotel;
    }

    /* =================== Queries =================== */

    @Transactional(readOnly = true)
    public List<Room> findAllForCurrentHotel() {
        return roomRepository.findByHotelId(currentHotel().getId());
    }

    @Transactional(readOnly = true)
    public Room findMyRoom() {
        User user = currentUser();
        return roomRepository.findFirstByClientId(user.getId())
                .orElseThrow(() -> new NotFoundException("Aucune chambre associée à l'utilisateur."));
    }

    @Transactional(readOnly = true)
    public Room findByIdForCurrentHotel(Long id) {
        Long hotelId = currentHotel().getId();
        return roomRepository.findByIdAndHotelId(id, hotelId)
                .orElseThrow(() -> new NotFoundException("Chambre non trouvée: " + id));
    }

    /* =================== CRUD =================== */

    public Room create(Room room) {
        Hotel hotel = currentHotel();
        room.setHotel(hotel);
        if (room.getRoomState() == null)
            room.setRoomState(LIBRE);
        room.setLastUpdated(LocalDateTime.now());

        if (roomRepository.existsByHotelIdAndRoomNumber(hotel.getId(), room.getRoomNumber())) {
            throw new BusinessRuleException("Numéro de chambre déjà utilisé dans cet hôtel.");
        }
        return roomRepository.save(room);
    }

    public Room update(Long id, Room updatedRoom) {
        Room existing = findByIdForCurrentHotel(id);
        Long hotelId = existing.getHotel().getId();

        if (updatedRoom.getRoomNumber() != existing.getRoomNumber() &&
                roomRepository.existsByHotelIdAndRoomNumber(hotelId, updatedRoom.getRoomNumber())) {
            throw new BusinessRuleException("Numéro de chambre déjà utilisé dans cet hôtel.");
        }

        existing.setRoomNumber(updatedRoom.getRoomNumber());
        existing.setRoomType(updatedRoom.getRoomType());
        existing.setFloor(updatedRoom.getFloor());
        existing.setDescription(updatedRoom.getDescription());
        existing.setActive(updatedRoom.isActive());
        existing.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(existing);
    }

    public void delete(Long id) {
        Room room = findByIdForCurrentHotel(id);
        if (!DELETABLE.contains(room.getRoomState())) {
            throw new BusinessRuleException("Suppression impossible: l'état actuel est " + room.getRoomState());
        }
        roomRepository.delete(room);
    }

    /* =================== Manual state changes (UI) =================== */

    public Room updateState(Long id, String newStateRaw) {
        Room room = findByIdForCurrentHotel(id);

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

    @Transactional(readOnly = true)
    public Set<RoomState> allowedTargets(Long roomId) {
        Room room = findByIdForCurrentHotel(roomId);
        return ALLOWED.getOrDefault(room.getRoomState(), Set.of());
    }

    /*
     * =================== System-level sync from reservations ===================
     */

    public Room applyReservationStatus(Room room, ReservationStatus status) {
        if (room == null || status == null)
            return room;

        RoomState target = switch (status) {
            case PENDING, CONFIRMED -> RESERVEE;
            case CHECKED_IN -> CHECKIN;
            case NO_SHOW -> A_VALIDER_LIBRE;
            case CANCELED -> LIBRE;
            case COMPLETED -> A_NETTOYER;
        };

        room.setRoomState(target);

        if (status == ReservationStatus.CANCELED
                || status == ReservationStatus.NO_SHOW
                || status == ReservationStatus.COMPLETED) {
            room.setClient(null);
        }

        room.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(room);
    }

    @Transactional
    public void generateRoomsForHotel(Hotel hotel) {
        if (hotel == null || hotel.getId() == null)
            return;
        if (hotel.getFloors() == null || hotel.getRoomsPerFloor() == null)
            return;
        if (hotel.getFloors() <= 0 || hotel.getRoomsPerFloor() <= 0)
            return;

        // ⚠ Attention: destructive
        deleteRoomsForHotel(hotel);

        List<Room> roomsToSave = new ArrayList<>();

        List<String> labels = hotel.getFloorLabels() == null ? List.of() : hotel.getFloorLabels();
        List<String> types = hotel.getRoomTypes() == null ? List.of() : hotel.getRoomTypes();

        String defaultType = types.isEmpty() ? "Standard" : types.get(0);

        for (int floorIndex = 0; floorIndex < hotel.getFloors(); floorIndex++) {

            String floorLabel = labels.size() > floorIndex
                    ? labels.get(floorIndex)
                    : (floorIndex == 0 ? "RDC" : "Étage " + floorIndex);

            for (int roomNumber = 1; roomNumber <= hotel.getRoomsPerFloor(); roomNumber++) {
                Room room = new Room();
                room.setHotel(hotel);

                room.setFloor(floorIndex);

                int number = Integer.parseInt(String.format("%d%02d", floorIndex, roomNumber));
                room.setRoomNumber(number);

                room.setRoomType(defaultType);
                room.setRoomState(RoomState.LIBRE);
                room.setDescription("Chambre " + number + " - " + floorLabel);
                room.setActive(true);
                room.setLastUpdated(LocalDateTime.now());

                roomsToSave.add(room);
            }
        }

        roomRepository.saveAll(roomsToSave);
    }

    @Transactional
    public void deleteRoomsForHotel(Hotel hotel) {
        if (hotel == null || hotel.getId() == null)
            return;
        List<Room> existing = roomRepository.findByHotelId(hotel.getId());
        roomRepository.deleteAll(existing);
    }

}
