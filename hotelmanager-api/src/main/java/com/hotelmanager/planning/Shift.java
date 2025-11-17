package com.hotelmanager.planning;

import com.hotelmanager.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private User employee;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    private String service; 
    @ManyToOne(optional = false)
    private User createdBy;
}
