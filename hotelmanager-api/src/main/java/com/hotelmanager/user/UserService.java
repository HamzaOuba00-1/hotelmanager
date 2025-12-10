package com.hotelmanager.user;

import com.hotelmanager.user.dto.ChangePasswordRequest;
import com.hotelmanager.user.dto.EmployeeRequest;
import com.hotelmanager.user.dto.UserResponse;
import com.hotelmanager.user.dto.UserSelfUpdateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getUsersByHotel(Long hotelId) {
        List<User> users = userRepository.findAllByHotelId(hotelId);
        return users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public User createEmployee(EmployeeRequest request, User manager) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé.");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setHotel(manager.getHotel());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // ✅ UPDATE SELF
    public User updateMyProfile(User me, UserSelfUpdateRequest req) {
        if (req.firstName() != null && !req.firstName().isBlank()) {
            me.setFirstName(req.firstName().trim());
        }
        if (req.lastName() != null && !req.lastName().isBlank()) {
            me.setLastName(req.lastName().trim());
        }

        if (req.email() != null && !req.email().isBlank()) {
            String newEmail = req.email().trim().toLowerCase();

            // si email change => vérifier unicité
            if (!newEmail.equalsIgnoreCase(me.getEmail())
                    && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email déjà utilisé.");
            }
            me.setEmail(newEmail);
        }

        return userRepository.save(me);
    }

    // ✅ CHANGE PASSWORD SELF
    public void changeMyPassword(User me, ChangePasswordRequest req) {
        if (!passwordEncoder.matches(req.currentPassword(), me.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }

        // mini règle simple (tu peux durcir)
        if (req.newPassword().length() < 8) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 8 caractères.");
        }

        me.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(me);
    }
}
