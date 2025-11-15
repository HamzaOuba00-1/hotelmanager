package com.hotelmanager.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ManualAttendanceRequest {
    private Long employeeId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;                 

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkInAt;        

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime checkOutAt;       

  
    private String status;

  
    private String source;

 
    private Double lat;
    private Double lng;
}
