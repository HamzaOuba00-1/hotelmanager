package com.hotelmanager.auth;

import com.hotelmanager.auth.payload.AuthRequest;
import com.hotelmanager.auth.payload.RegisterManagerRequest;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.auth.payload.AuthResponse;
import com.hotelmanager.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.hotelmanager.user.User;
import com.hotelmanager.hotel.HotelRepository;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final HotelRepository hotelRepository;

    @PostMapping("/register/manager")
    public ResponseEntity<AuthResponse> registerManager(@RequestBody RegisterManagerRequest request) {
        return ResponseEntity.ok(authService.registerManager(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<String> me(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok("Bonjour " + user.getFirstName() + " (" + user.getRole() + ")");
    }



}
