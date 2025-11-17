package com.hotelmanager.hotel;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "hotel")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 255)
    private String name;

    @Column(unique = true, nullable = false, length = 64)
    private String code; 
    @Size(max = 500)
    private String address;

    @Size(max = 50)
    private String phone;

    @Email @Size(max = 255)
    private String email;

    @Size(max = 1024)
    private String logoUrl;

    private Double latitude;   // nullable
    private Double longitude;  // nullable

    // 2) Structure
    private Integer floors;          // nullable optional in UI
    private Integer roomsPerFloor;

    @ElementCollection
    @CollectionTable(name = "hotel_floor_labels", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "label")
    private List<String> floorLabels = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "hotel_room_types", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "type")
    private List<String> roomTypes = new ArrayList<>();

    // 3) Services
    @Embedded
    private Services services = new Services();

    // 4) Schedules
    private String checkInHour;   // "14:00"
    private String checkOutHour;  // "12:00"

    @ElementCollection
    @CollectionTable(name = "hotel_closed_days", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "closed_day")
    private List<String> closedDays = new ArrayList<>(); // ISO yyyy-MM-dd

    @Embedded
    private Season highSeason; // nullable

    // 5) Policy
    @Lob
    private String cancellationPolicy;
    private Integer minAge;
    private Boolean petsAllowed;

    @ElementCollection
    @CollectionTable(name = "hotel_payments", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "payment")
    private List<String> acceptedPayments = new ArrayList<>();

    // 6) Security & Access
    private Boolean active = true;

    

    // Relation inverse si besoin
    // @OneToMany(mappedBy = "hotel")
    // private List<User> managers;

    // Embeddables
    @Embeddable
    @Getter @Setter
    public static class Services {
        private Boolean hasRestaurant = false;
        private Boolean hasLaundry = false;
        private Boolean hasShuttle = false;
        private Boolean hasGym = false;
        private Boolean hasPool = false;
        private Boolean hasBusinessCenter = false;
    }

    @Embeddable
    @Getter @Setter
    public static class Season {
        private String fromDate; // yyyy-MM-dd
        private String toDate;   // yyyy-MM-dd
    }
}