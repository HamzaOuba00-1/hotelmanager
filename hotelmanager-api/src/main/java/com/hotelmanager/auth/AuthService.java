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

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final HotelRepository hotelRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;

        // Remplacement de @RequiredArgsConstructor
        public AuthService(UserRepository userRepository,
                        HotelRepository hotelRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil,
                        AuthenticationManager authenticationManager) {
                this.userRepository = userRepository;
                this.hotelRepository = hotelRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.authenticationManager = authenticationManager;
        }

        public AuthResponse registerManager(RegisterManagerRequest request) {
                Hotel hotel = hotelRepository.findByCode(request.getHotelCode())
                                .orElseGet(() -> {
                                        Hotel newHotel = new Hotel();
                                        newHotel.setName(request.getHotelName());
                                        newHotel.setCode(request.getHotelCode());
                                        return hotelRepository.save(newHotel);
                                });

                User user = new User();
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setRole(Role.MANAGER);
                user.setHotel(hotel);
                user.setEnabled(true);

                userRepository.save(user);
                String token = jwtUtil.generateToken(user);
                Hotel hotelForResponse = user.getHotel();
                return new AuthResponse(
                        token,
                        hotelForResponse != null ? hotelForResponse.getId() : null,
                        hotelForResponse != null ? hotelForResponse.getName() : null,
                        user.getEmail());
        }

        public AuthResponse login(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                String token = jwtUtil.generateToken(user);

                Hotel hotel = user.getHotel(); // Assure-toi que `User` a bien un champ `Hotel`

                return new AuthResponse(
                                token,
                                hotel != null ? hotel.getId() : null,
                                hotel != null ? hotel.getName() : null,
                                user.getEmail()
                                );
        }

}