package com.hotelmanager.room;

import com.hotelmanager.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int roomNumber;
    private String roomType; // simple, double, suite
    private String roomState; // libre, à_nettoyer, occupée, etc.
    private int floor;
    private String description;
    private boolean active;

    private LocalDateTime lastUpdated;

    @ManyToOne
    private User client; // Nullable
}
