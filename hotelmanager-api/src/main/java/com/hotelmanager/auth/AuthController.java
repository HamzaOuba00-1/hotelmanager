package com.hotelmanager.auth;

import com.hotelmanager.auth.payload.AuthRequest;
import com.hotelmanager.auth.payload.AuthResponse;
import com.hotelmanager.auth.payload.RegisterManagerRequest;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
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
        // getName() correspond en général au username/email authentifié
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
