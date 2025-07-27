package com.hotelmanager.auth.payload;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long hotelId;
    private String hotelName;
    private String email;
}
