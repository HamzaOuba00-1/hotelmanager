package com.hotelmanager.planning.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotelmanager.planning.entity.Shift;

import java.time.LocalDate;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByEmployeeHotelIdAndDateBetween(Long hotelId, LocalDate start, LocalDate end);
    List<Shift> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);
    List<Shift> findByEmployeeIdAndDateBetweenOrderByDateAscStartTimeAsc(
            Long employeeId, LocalDate start, LocalDate end
    );

}
