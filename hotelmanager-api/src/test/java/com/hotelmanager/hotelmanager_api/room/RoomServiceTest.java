package com.hotelmanager.hotelmanager_api.room;

import com.hotelmanager.room.Room;
import com.hotelmanager.room.RoomRepository;
import com.hotelmanager.room.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class RoomServiceTest {
    private RoomRepository roomRepository;
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomRepository = mock(RoomRepository.class);
        roomService = new RoomService(roomRepository);
    }

    @Test
    void shouldCreateRoomWithActiveAndLastUpdatedFieldsSet() {
        Room room = new Room();
        room.setRoomNumber(101);
        room.setRoomType("double");
        room.setRoomState("available");

        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Room saved = roomService.create(room);

        assertTrue(saved.isActive());
        assertNotNull(saved.getLastUpdated());
        verify(roomRepository).save(room);
    }

    @Test
    void shouldUpdateRoomSuccessfully() {
        Room existing = new Room();
        existing.setId(1L);
        existing.setRoomNumber(101);
        existing.setRoomState("available");

        Room updated = new Room();
        updated.setRoomNumber(102);
        updated.setRoomType("suite");
        updated.setRoomState("occupied");
        updated.setFloor(2);
        updated.setDescription("Updated room");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Room result = roomService.update(1L, updated);

        assertEquals(102, result.getRoomNumber());
        assertEquals("suite", result.getRoomType());
        assertEquals("occupied", result.getRoomState());
        assertEquals(2, result.getFloor());
        assertEquals("Updated room", result.getDescription());
        assertNotNull(result.getLastUpdated());
    }

    @Test
    void shouldThrowExceptionWhenDeletingOccupiedRoom() {
        Room room = new Room();
        room.setId(1L);
        room.setRoomState("occupied");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> roomService.delete(1L));
        assertEquals("Cannot delete a room that is currently occupied.", exception.getMessage());
    }
}
