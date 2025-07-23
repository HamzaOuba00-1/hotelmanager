package com.hotelmanager.user;

import com.hotelmanager.hotel.HotelRepository;
import com.hotelmanager.user.dto.UserResponse;
import com.hotelmanager.user.dto.EmployeeRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HotelRepository hotelRepository;
    private final UserService userService;

    // ✅ Remplacement de @RequiredArgsConstructor
    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          HotelRepository hotelRepository,
                          UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.hotelRepository = hotelRepository;
        this.userService = userService;
    }

    /*────────────────────────  GET  ────────────────────────*/

    /** Liste de tous les utilisateurs – MANAGER uniquement */
    @GetMapping
    @PreAuthorize("hasAuthority('MANAGER')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                             .stream()
                             .map(UserResponse::from)
                             .toList();
    }

    /** Détail d’un utilisateur – MANAGER uniquement */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                             .map(UserResponse::from)
                             .map(ResponseEntity::ok)
                             .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('MANAGER')")
    @GetMapping("/my-hotel")
    public List<User> getUsersFromMyHotel(Authentication authentication) {
        User manager = (User) authentication.getPrincipal();
        return userRepository.findAll().stream()
                .filter(u -> u.getHotel() != null && u.getHotel().getId().equals(manager.getHotel().getId()))
                .toList();
    }

    @GetMapping("/users/my-hotel")
    public List<UserResponse> getUsersOfMyHotel(@AuthenticationPrincipal User user) {
        return userService.getUsersByHotel(user.getHotel().getId());
    }

    @GetMapping("/hotel/{hotelId}")
    public List<UserResponse> getUsersByHotel(@PathVariable Long hotelId) {
        return userService.getUsersByHotel(hotelId);
    }

    /*───────────────────────  DELETE  ───────────────────────*/

    /** Suppression par id – MANAGER uniquement */
    @PreAuthorize("hasAuthority('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
