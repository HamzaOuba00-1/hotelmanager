package com.hotelmanager.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotelmanager.user.entity.Role;
import com.hotelmanager.user.entity.User;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByHotelId(Long hotelId); 
    boolean existsByEmail(String email);
    Optional<User> findOneWithHotelByEmail(String email);
    List<User> findAllByHotel_IdAndRole(Long hotelId, Role role);
}
