package com.hotelmanager.crew;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.User;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "crews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_crew_name_hotel",
        columnNames = {"name", "hotel_id"}
    )
)
public class Crew {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType service;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToMany
    @JoinTable(
        name = "crew_members",
        joinColumns = @JoinColumn(name = "crew_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    public Crew() {}
    public Crew(String name, ServiceType service, Hotel hotel) {
        this.name = name;
        this.service = service;
        this.hotel = hotel;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ServiceType getService() { return service; }
    public void setService(ServiceType service) { this.service = service; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }
}
