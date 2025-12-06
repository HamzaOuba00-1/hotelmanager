package com.hotelmanager.reservation;

import com.hotelmanager.room.Room;
import com.hotelmanager.room.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class RoomReservationSync {

    private final RoomService roomService;

    @Transactional
    public void applyStatusToRoom(Reservation res) {
        Room room = res.getRoom();
        if (room == null) return;

        roomService.applyReservationStatus(room, res.getStatus());
    }
}
