package com.hotelmanager.planning.dto;

import java.time.format.DateTimeFormatter;

import com.hotelmanager.planning.Shift;
import com.hotelmanager.user.dto.UserDto;
import lombok.Data;

@Data
public class ShiftDto {
    private Long id;
    private String date;
    private String startTime;
    private String endTime;
    private String service;
    private UserDto employee;

    public static ShiftDto from(Shift shift) {
        ShiftDto dto = new ShiftDto();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        dto.setId(shift.getId());
        dto.setDate(shift.getDate().toString());
        dto.setStartTime(shift.getStartTime().format(timeFormatter));
        dto.setEndTime(shift.getEndTime().format(timeFormatter));
        dto.setService(shift.getService());
        dto.setEmployee(UserDto.from(shift.getEmployee()));
        return dto;
    }
}
