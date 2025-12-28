package com.hotelmanager.attendance.entity;

import com.hotelmanager.hotel.entity.Hotel;
import com.hotelmanager.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "daily_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) 
    private Hotel hotel;

    @Column(nullable = false, length = 12)
    private String code;

    @Column(nullable = false)
    private LocalDateTime validFrom;

    @Column(nullable = false)
    private LocalDateTime validUntil;

    @ManyToOne(optional = false)
    private User createdBy;

    private LocalDateTime revokedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

}
