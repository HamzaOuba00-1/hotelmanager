package com.hotelmanager.user;

import com.hotelmanager.hotel.HotelRepository;
import com.hotelmanager.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

import com.hotelmanager.user.dto.UserCreatedResponse;
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

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          HotelRepository hotelRepository,
                          UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.hotelRepository = hotelRepository;
        this.userService = userService;
    }

    /* ──────────────── GET ──────────────── */

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGER')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-hotel")
    @PreAuthorize("hasAuthority('MANAGER')")
    public List<UserResponse> getUsersFromMyHotel(@AuthenticationPrincipal User manager) {
        return userService.getUsersByHotel(manager.getHotel().getId());
    }

    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public List<UserResponse> getUsersByHotel(@PathVariable Long hotelId) {
        return userService.getUsersByHotel(hotelId);
    }

    
    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserResponse.from(user));
    }


    /* ──────────────── POST ──────────────── */

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<UserCreatedResponse> createEmployee(
            @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal User manager) {

        User createdUser = userService.createEmployee(request, manager);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserCreatedResponse.from(createdUser));
    }




    /* ──────────────── DELETE ──────────────── */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
