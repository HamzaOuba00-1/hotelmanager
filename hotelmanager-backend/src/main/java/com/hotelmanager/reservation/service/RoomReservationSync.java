package com.hotelmanager.reservation.service;

import com.hotelmanager.reservation.entity.Reservation;
import com.hotelmanager.room.entity.Room;
import com.hotelmanager.room.service.RoomService;

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
