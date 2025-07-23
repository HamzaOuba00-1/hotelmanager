package com.hotelmanager.hotel;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.hotelmanager.user.User;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "hotel")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String code;

    @OneToMany(mappedBy = "hotel")
    @JsonManagedReference
    private List<User> managers;

    // Constructeur vide (nécessaire pour JPA)
    public Hotel() {}

    // Constructeur avec tous les arguments
    public Hotel(Long id, String name, String code, List<User> managers) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.managers = managers;
    }

    // Getters et setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public List<User> getManagers() {
        return managers;
    }

    public void setManagers(List<User> managers) {
        this.managers = managers;
    }

    // Builder manuel (facultatif, mais utile)
    public static HotelBuilder builder() {
        return new HotelBuilder();
    }

    public static class HotelBuilder {
        private Long id;
        private String name;
        private String code;
        private List<User> managers;

        public HotelBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HotelBuilder name(String name) {
            this.name = name;
            return this;
        }

        public HotelBuilder code(String code) {
            this.code = code;
            return this;
        }

        public HotelBuilder managers(List<User> managers) {
            this.managers = managers;
            return this;
        }

        public Hotel build() {
            return new Hotel(id, name, code, managers);
        }
    }
}
