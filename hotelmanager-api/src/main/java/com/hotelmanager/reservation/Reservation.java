package com.hotelmanager.reservation;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.room.Room;
import com.hotelmanager.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(
    name = "reservations",
    indexes = {
        @Index(name = "idx_reservations_hotel", columnList = "hotel_id"),
        @Index(name = "idx_reservations_room", columnList = "room_id"),
        @Index(name = "idx_reservations_start_end", columnList = "start_at,end_at")
    }
)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Hotel
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @Column(name = "guest_first_name", nullable = false, length = 64)
    private String guestFirstName;

    @Column(name = "guest_last_name", nullable = false, length = 64)
    private String guestLastName;

    @Column(name = "guest_phone", length = 32)
    private String guestPhone;

    @NotNull
    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;

    @NotNull
    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt; 

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Version
    private Long version; // Optimistic locking

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
