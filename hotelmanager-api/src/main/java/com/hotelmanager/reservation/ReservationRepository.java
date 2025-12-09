package com.hotelmanager.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        select case when count(r) > 0 then true else false end
        from Reservation r
        where r.room.id = :roomId
          and r.status in (com.hotelmanager.reservation.ReservationStatus.PENDING,
                           com.hotelmanager.reservation.ReservationStatus.CONFIRMED,
                           com.hotelmanager.reservation.ReservationStatus.CHECKED_IN)
          and not (r.endAt <= :startAt or r.startAt >= :endAt)
    """)
    boolean existsOverlapping(Long roomId, OffsetDateTime startAt, OffsetDateTime endAt);

    List<Reservation> findByHotelId(Long hotelId);

    List<Reservation> findByClientId(Long clientId);

    @Query("""
        select r
        from Reservation r
        where r.room.id = :roomId
          and r.status in (com.hotelmanager.reservation.ReservationStatus.PENDING,
                           com.hotelmanager.reservation.ReservationStatus.CONFIRMED,
                           com.hotelmanager.reservation.ReservationStatus.CHECKED_IN)
          and r.endAt > :ref
        order by r.startAt asc
    """)
    List<Reservation> findActiveFutureByRoom(Long roomId, OffsetDateTime ref);

    default Optional<Reservation> findOneActiveFutureByRoom(Long roomId, OffsetDateTime ref) {
        return findActiveFutureByRoom(roomId, ref).stream().findFirst();
    }
}
