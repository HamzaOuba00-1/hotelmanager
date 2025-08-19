package com.hotelmanager.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByHotelId(Long hotelId); // À ajouter
    boolean existsByEmail(String email);
    Optional<User> findOneWithHotelByEmail(String email);
}
