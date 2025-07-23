package com.hotelmanager.auth.payload;

public class AuthRequest {
    private String email;
    private String password;

    public AuthRequest() {
        // Constructeur vide requis pour la désérialisation (ex: Spring, Jackson, etc.)
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
}
