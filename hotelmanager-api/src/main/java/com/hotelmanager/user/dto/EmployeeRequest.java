package com.hotelmanager.user.dto;

import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.Role;

public class EmployeeRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Hotel hotel;

    // Constructeur vide (utile pour la désérialisation avec Jackson/Spring)
    public EmployeeRequest() {
    }

    // Getters et Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    // toString (optionnel mais utile pour le debug)
    @Override
    public String toString() {
        return "EmployeeRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role=" + role +
                ", hotel=" + (hotel != null ? hotel.getId() : null) +
                '}';
    }
}
