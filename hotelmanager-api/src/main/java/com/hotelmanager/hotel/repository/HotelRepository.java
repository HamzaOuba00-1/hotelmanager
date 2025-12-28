package com.hotelmanager.hotel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotelmanager.hotel.entity.Hotel;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    Optional<Hotel> findByCode(String code);
    List<Hotel> findAllByActiveTrue();
}
