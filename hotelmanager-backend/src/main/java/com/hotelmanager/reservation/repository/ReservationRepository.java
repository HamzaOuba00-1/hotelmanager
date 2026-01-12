package com.hotelmanager.reservation.repository;

import com.hotelmanager.reservation.entity.Reservation;
import com.hotelmanager.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /* ================= OVERLAPPING ================= */

    @Query("""
        select case when count(r) > 0 then true else false end
        from Reservation r
        where r.room.id = :roomId
          and r.status in :activeStatuses
          and not (r.endAt <= :startAt or r.startAt >= :endAt)
    """)
    boolean existsOverlapping(
        @Param("roomId") Long roomId,
        @Param("startAt") OffsetDateTime startAt,
        @Param("endAt") OffsetDateTime endAt,
        @Param("activeStatuses") List<ReservationStatus> activeStatuses
    );

    default boolean existsOverlapping(
        Long roomId,
        OffsetDateTime startAt,
        OffsetDateTime endAt
    ) {
        return existsOverlapping(
            roomId,
            startAt,
            endAt,
            List.of(
                ReservationStatus.PENDING,
                ReservationStatus.CONFIRMED,
                ReservationStatus.CHECKED_IN
            )
        );
    }

    /* ================= ACTIVE FUTURE ================= */

    @Query("""
        select r
        from Reservation r
        where r.room.id = :roomId
          and r.status in :activeStatuses
          and r.endAt > :ref
        order by r.startAt asc
    """)
    List<Reservation> findActiveFutureByRoom(
        @Param("roomId") Long roomId,
        @Param("ref") OffsetDateTime ref,
        @Param("activeStatuses") List<ReservationStatus> activeStatuses
    );

    default List<Reservation> findActiveFutureByRoom(Long roomId, OffsetDateTime ref) {
        return findActiveFutureByRoom(
            roomId,
            ref,
            List.of(
                ReservationStatus.PENDING,
                ReservationStatus.CONFIRMED,
                ReservationStatus.CHECKED_IN
            )
        );
    }

    /* ================= SIMPLE QUERIES (OBLIGATOIRES) ================= */

    List<Reservation> findByHotelId(Long hotelId);

    List<Reservation> findByClientId(Long clientId);
}
