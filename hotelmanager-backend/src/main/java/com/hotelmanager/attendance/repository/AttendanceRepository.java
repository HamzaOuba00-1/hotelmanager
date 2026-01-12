package com.hotelmanager.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotelmanager.attendance.entity.Attendance;

import java.time.LocalDate;
import java.util.*;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByEmployeeIdAndCheckOutAtIsNull(Long employeeId);

    Optional<Attendance> findFirstByEmployeeIdAndCheckOutAtIsNullOrderByCheckInAtDesc(Long employeeId);

    List<Attendance> findByEmployeeHotelIdAndDateBetween(Long hotelId, LocalDate start, LocalDate end);
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end); // 

}
