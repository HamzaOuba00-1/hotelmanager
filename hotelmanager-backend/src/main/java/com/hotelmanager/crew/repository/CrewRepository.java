package com.hotelmanager.crew.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotelmanager.crew.entity.Crew;

import java.util.List;
import java.util.Optional;

public interface CrewRepository extends JpaRepository<Crew, Long> {
    List<Crew> findAllByHotelId(Long hotelId);
    boolean existsByNameIgnoreCaseAndHotelId(String name, Long hotelId);
    Optional<Crew> findByIdAndHotelId(Long id, Long hotelId);
}
