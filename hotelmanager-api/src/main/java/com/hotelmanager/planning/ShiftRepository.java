package com.hotelmanager.planning;

import com.hotelmanager.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByEmployeeHotelIdAndDateBetween(Long hotelId, LocalDate start, LocalDate end);
    List<Shift> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);
}
