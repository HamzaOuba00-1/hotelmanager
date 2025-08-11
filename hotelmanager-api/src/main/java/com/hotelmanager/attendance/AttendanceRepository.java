// src/main/java/com/hotelmanager/attendance/AttendanceRepository.java
package com.hotelmanager.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.*;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByEmployeeIdAndCheckOutAtIsNull(Long employeeId);

    Optional<Attendance> findFirstByEmployeeIdAndCheckOutAtIsNullOrderByCheckInAtDesc(Long employeeId);

    // même pattern que ton ShiftRepository (traversée employee.hotel.id)
    List<Attendance> findByEmployeeHotelIdAndDateBetween(Long hotelId, LocalDate start, LocalDate end);
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end); // 

}
