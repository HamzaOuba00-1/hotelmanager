package com.hotelmanager.auth.payload;

import java.util.Objects;

public class AuthResponse {
    private String token;

    // Constructeur sans arguments
    public AuthResponse() {
    }

    // Constructeur avec tous les arguments
    public AuthResponse(String token) {
        this.token = token;
    }

    // Getter
    public String getToken() {
        return token;
    }

    // Setter
    public void setToken(String token) {
        this.token = token;
    }

    // toString()
    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                '}';
    }

    // equals()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuthResponse)) return false;
        AuthResponse that = (AuthResponse) o;
        return Objects.equals(token, that.token);
    }

    // hashCode()
    @Override
    public int hashCode() {
        return Objects.hash(token);
    }
}
