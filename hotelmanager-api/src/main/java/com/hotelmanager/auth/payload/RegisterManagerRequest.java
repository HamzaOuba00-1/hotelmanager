package com.hotelmanager.auth.payload;

import java.util.Objects;

public class RegisterManagerRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String hotelCode;
    private String hotelName; // peut être null si on rejoint un hôtel existant

    public RegisterManagerRequest() {
    }

    public RegisterManagerRequest(String firstName, String lastName, String email, String password, String hotelCode, String hotelName) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.hotelCode = hotelCode;
        this.hotelName = hotelName;
    }

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

    public String getHotelCode() {
        return hotelCode;
    }

    public void setHotelCode(String hotelCode) {
        this.hotelCode = hotelCode;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    @Override
    public String toString() {
        return "RegisterManagerRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", hotelCode='" + hotelCode + '\'' +
                ", hotelName='" + hotelName + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegisterManagerRequest)) return false;
        RegisterManagerRequest that = (RegisterManagerRequest) o;
        return Objects.equals(firstName, that.firstName) &&
                Objects.equals(lastName, that.lastName) &&
                Objects.equals(email, that.email) &&
                Objects.equals(password, that.password) &&
                Objects.equals(hotelCode, that.hotelCode) &&
                Objects.equals(hotelName, that.hotelName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName, email, password, hotelCode, hotelName);
    }
}
