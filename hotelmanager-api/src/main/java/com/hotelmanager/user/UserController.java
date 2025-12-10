package com.hotelmanager.user;

import com.hotelmanager.hotel.HotelRepository;
import com.hotelmanager.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository,
                          HotelRepository hotelRepository,
                          UserService userService) {
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.userService = userService;
    }

    /* ──────────────── GET ──────────────── */

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-hotel")
    @PreAuthorize("hasRole('MANAGER')")
    public List<UserResponse> getUsersFromMyHotel(@AuthenticationPrincipal User manager) {
        return userService.getUsersByHotel(manager.getHotel().getId());
    }

    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('MANAGER')")
    public List<UserResponse> getUsersByHotel(@PathVariable Long hotelId) {
        return userService.getUsersByHotel(hotelId);
    }

    // ✅ FIX: /users/me (pas /users/users/me)
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserResponse.from(user));
    }

    /* ──────────────── POST ──────────────── */

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserCreatedResponse> createEmployee(
            @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal User manager) {

        User createdUser = userService.createEmployee(request, manager);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserCreatedResponse.from(createdUser));
    }

    /* ──────────────── PUT (SELF) ──────────────── */

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMe(
            @Valid @RequestBody UserSelfUpdateRequest req,
            @AuthenticationPrincipal User me
    ) {
        User updated = userService.updateMyProfile(me, req);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest req,
            @AuthenticationPrincipal User me
    ) {
        userService.changeMyPassword(me, req);
        return ResponseEntity.noContent().build();
    }

    /* ──────────────── DELETE ──────────────── */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
