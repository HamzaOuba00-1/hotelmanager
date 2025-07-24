package com.hotelmanager.user;

import com.hotelmanager.hotel.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final HotelRepository  hotelRepository;   // si tu en as besoin ailleurs

    /*────────────────────────  GET  ────────────────────────*/

    /** Liste de tous les utilisateurs – MANAGER uniquement */
    @PreAuthorize("hasAuthority('MANAGER')")
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Détail d’un utilisateur – MANAGER uniquement */
    @PreAuthorize("hasAuthority('MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*───────────────────────  POST create  ───────────────────────*/

    /** Création d’un utilisateur (EMPLOYE ou CLIENT) par le MANAGER */
    

    /*───────────────────────  DELETE  ───────────────────────*/

    /** Suppression par id – MANAGER uniquement */
    @PreAuthorize("hasAuthority('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();    // 204
    }
}
