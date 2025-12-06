package com.hotelmanager.planning;

import com.hotelmanager.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    public Shift createShift(Shift shift) {
        return shiftRepository.save(shift);
    }

    public List<Shift> getShiftsForHotel(Long hotelId, LocalDate start, LocalDate end) {
        return shiftRepository.findByEmployeeHotelIdAndDateBetween(hotelId, start, end);
    }

    public List<Shift> getShiftsForEmployee(Long employeeId, LocalDate start, LocalDate end) {
        return shiftRepository.findByEmployeeIdAndDateBetweenOrderByDateAscStartTimeAsc(employeeId, start, end);
    }


    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}
