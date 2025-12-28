package com.hotelmanager.auth.controller;

import com.hotelmanager.auth.dto.AuthRequest;
import com.hotelmanager.auth.dto.AuthResponse;
import com.hotelmanager.auth.dto.RegisterManagerRequest;
import com.hotelmanager.auth.service.AuthService;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register/manager")
    public ResponseEntity<AuthResponse> registerManager(@RequestBody RegisterManagerRequest request) {
        return ResponseEntity.ok(authService.registerManager(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return ResponseEntity.ok(MeResponse.from(user));
    }

    public record MeResponse(
            Long id,
            String firstName,
            String lastName,
            String role,
            Long hotelId
    ) {
        public static MeResponse from(User u) {
            return new MeResponse(
                    u.getId(),
                    u.getFirstName(),
                    u.getLastName(),
                    u.getRole().name(),
                    u.getHotel() != null ? u.getHotel().getId() : null
            );
        }
    }
}
