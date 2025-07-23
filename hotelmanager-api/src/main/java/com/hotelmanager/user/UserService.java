package com.hotelmanager.user;

import com.hotelmanager.user.dto.UserResponse;
import com.hotelmanager.user.dto.EmployeeRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Remplacement de @RequiredArgsConstructor
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Récupère tous les utilisateurs associés à un hôtel spécifique.
     */
    public List<UserResponse> getUsersByHotel(Long hotelId) {
        List<User> users = userRepository.findAllByHotelId(hotelId);
        return users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Crée un nouvel employé avec mot de passe crypté.
     */
    public void createEmployee(EmployeeRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setHotel(request.getHotel());

        userRepository.save(user);
    }

    /**
     * Récupère un utilisateur par ID.
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
