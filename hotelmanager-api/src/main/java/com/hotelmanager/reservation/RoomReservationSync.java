// com/hotelmanager/reservation/RoomReservationSync.java
package com.hotelmanager.reservation;

import com.hotelmanager.room.Room;
import com.hotelmanager.room.RoomRepository;
import com.hotelmanager.room.RoomState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RoomReservationSync {

  private final RoomRepository roomRepository;

  @Transactional
  public void applyStatusToRoom(Reservation res) {
    Room room = res.getRoom();
    if (room == null) return;

    RoomState target = switch (res.getStatus()) {
      case PENDING, CONFIRMED -> RoomState.RESERVEE;
      case CHECKED_IN         -> RoomState.CHECKIN;
      case NO_SHOW            -> RoomState.A_VALIDER_LIBRE;
      case CANCELED           -> RoomState.LIBRE;
      case COMPLETED          -> RoomState.A_NETTOYER;
    };

    room.setRoomState(target);
    if (res.getStatus() == ReservationStatus.CANCELED
        || res.getStatus() == ReservationStatus.NO_SHOW
        || res.getStatus() == ReservationStatus.COMPLETED) {
      room.setClient(null); // on détache le client si séjour fini / annulé
    }
    room.setLastUpdated(LocalDateTime.now());
    roomRepository.save(room);
  }
}
