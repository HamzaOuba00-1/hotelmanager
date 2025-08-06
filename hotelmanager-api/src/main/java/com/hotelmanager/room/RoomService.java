package com.hotelmanager.room;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    /**
     * Génère automatiquement toutes les chambres d'un hôtel
     * en fonction de sa configuration (étages, labels, nb chambres par étage).
     */
    public void generateRoomsForHotel(Hotel hotel) {
        if (hotel.getFloors() == null || hotel.getRoomsPerFloor() == null) {
            return; // pas de config => pas de génération
        }

        // Supprimer les anciennes chambres de cet hôtel
        deleteRoomsForHotel(hotel);

        List<Room> roomsToSave = new ArrayList<>();

        for (int floorIndex = 0; floorIndex < hotel.getFloors(); floorIndex++) {
            String floorLabel = hotel.getFloorLabels().size() > floorIndex
                    ? hotel.getFloorLabels().get(floorIndex)
                    : String.valueOf(floorIndex);

            for (int roomNumber = 1; roomNumber <= hotel.getRoomsPerFloor(); roomNumber++) {
                Room room = new Room();
                room.setFloor(floorIndex); // index numérique
                int number = Integer.parseInt(String.format("%d%02d", floorIndex, roomNumber));
                room.setRoomNumber(number);
                room.setRoomType(hotel.getRoomTypes().isEmpty() ? "Standard" : hotel.getRoomTypes().get(0));
                room.setRoomState("LIBRE");
                room.setDescription("Chambre " + room.getRoomNumber() + " -  " + floorLabel);
                room.setActive(true);
                room.setLastUpdated(LocalDateTime.now());
                roomsToSave.add(room);
            }
        }

        roomRepository.saveAll(roomsToSave);
    }

    /**
     * Supprime toutes les chambres d'un hôtel
     */
    public void deleteRoomsForHotel(Hotel hotel) {
        List<Room> existing = roomRepository.findByHotelId(hotel.getId());
        roomRepository.deleteAll(existing);
    }

    public Room create(Room room) {
        room.setLastUpdated(LocalDateTime.now());
        room.setActive(true);
        return roomRepository.save(room);
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room update(Long id, Room updatedRoom) {
        Room existing = roomRepository.findById(id).orElseThrow();
        existing.setRoomNumber(updatedRoom.getRoomNumber());
        existing.setRoomType(updatedRoom.getRoomType());
        existing.setFloor(updatedRoom.getFloor());
        existing.setRoomState(updatedRoom.getRoomState());
        existing.setDescription(updatedRoom.getDescription());
        existing.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(existing);
    }

    public void delete(Long id) {
        Room room = roomRepository.findById(id).orElseThrow();
        if ("OCCUPEE".equalsIgnoreCase(room.getRoomState())) {
            throw new RuntimeException("Impossible de supprimer une chambre occupée.");
        }
        roomRepository.deleteById(id);
    }

    public Room updateState(Long id, String newState) {
        Room room = roomRepository.findById(id).orElseThrow();
        room.setRoomState(newState);
        room.setLastUpdated(LocalDateTime.now());
        return roomRepository.save(room);
    }
}
