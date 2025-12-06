package com.hotelmanager.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    boolean existsByHotelIdAndRoomNumber(Long hotelId, int roomNumber);

    List<Room> findByHotelId(Long hotelId);

    Optional<Room> findFirstByClientId(Long clientId);

    List<Room> findByHotelIdAndActiveTrueAndRoomState(Long hotelId, RoomState state);

    Optional<Room> findByIdAndHotelId(Long id, Long hotelId);

    @Query(value = """
        SELECT r.*
        FROM rooms r
        WHERE r.hotel_id = :hotelId
          AND r.active = true
          AND r.room_state = 'LIBRE'
          AND NOT EXISTS (
            SELECT 1
            FROM reservations res
            WHERE res.room_id = r.id
              AND res.status IN ('PENDING','CONFIRMED','CHECKED_IN')
              AND NOT (res.end_at <= :startAt OR res.start_at >= :endAt)
          )
        ORDER BY r.room_number ASC
    """, nativeQuery = true)
    List<Room> findAvailableRoomsStrictlyLibre(Long hotelId, OffsetDateTime startAt, OffsetDateTime endAt);
}
