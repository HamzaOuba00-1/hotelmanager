package com.hotelmanager.auth;

import com.hotelmanager.auth.payload.AuthRequest;
import com.hotelmanager.auth.payload.AuthResponse;
import com.hotelmanager.auth.payload.RegisterManagerRequest;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.hotel.HotelRepository;
import com.hotelmanager.user.Role;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import com.hotelmanager.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse registerManager(RegisterManagerRequest request) {
        Hotel hotel = hotelRepository.findByCode(request.getHotelCode())
                .orElseGet(() -> {
                    Hotel newHotel = Hotel.builder()
                            .name(request.getHotelName())
                            .code(request.getHotelCode())
                            .build();
                    return hotelRepository.save(newHotel);
                });

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MANAGER)
                .hotel(hotel)
                .enabled(true)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token);
    }
}
