package com.hotelmanager.room;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
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
        if ("occupied".equalsIgnoreCase(room.getRoomState())) {
            throw new RuntimeException("Cannot delete a room that is currently occupied.");
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
