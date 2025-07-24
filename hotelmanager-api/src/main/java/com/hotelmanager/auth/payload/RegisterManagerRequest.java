package com.hotelmanager.auth.payload;

import lombok.Data;

@Data
public class RegisterManagerRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String hotelCode;
    private String hotelName; // peut être null si on rejoint un hôtel existant
}
