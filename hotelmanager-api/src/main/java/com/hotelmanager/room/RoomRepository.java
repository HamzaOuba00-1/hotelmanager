package com.hotelmanager.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByRoomNumber(int roomNumber);
    List<Room> findByHotelId(Long hotelId);
}

