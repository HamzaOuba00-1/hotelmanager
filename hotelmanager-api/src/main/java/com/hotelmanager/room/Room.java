package com.hotelmanager.room;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "rooms",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_hotel_number",
                        columnNames = {"hotel_id", "room_number"}
                )
        },
        indexes = {
                @Index(name = "idx_rooms_hotel", columnList = "hotel_id"),
                @Index(name = "idx_rooms_state", columnList = "room_state")
        }
)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(1)
    @Column(name = "room_number", nullable = false)
    private int roomNumber;

    @NotBlank
    @Column(name = "room_type", nullable = false, length = 64)
    private String roomType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "room_state", nullable = false, length = 32)
    private RoomState roomState = RoomState.LIBRE;

    @Column(name = "floor", nullable = false)
    private int floor;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @PrePersist
    public void prePersist() {
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
