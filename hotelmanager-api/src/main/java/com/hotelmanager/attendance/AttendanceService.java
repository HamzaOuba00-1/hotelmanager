// src/main/java/com/hotelmanager/attendance/AttendanceService.java
package com.hotelmanager.attendance;

import com.hotelmanager.attendance.dto.AttendanceDto;
import com.hotelmanager.attendance.dto.CheckOutResponse;
import com.hotelmanager.attendance.dto.ManualAttendanceRequest;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

  private final AttendanceRepository attRepo;
  private final DailyCodeRepository codeRepo;
  private final UserRepository userRepository;
  private final AttendanceRepository attendanceRepository;

  private final DailyCodeService dailyCodeService; // 👈 injecte le service, plus le repo

  @Transactional
  public Attendance checkIn(User employee, String code, Double lat, Double lng) {
    var now = LocalDateTime.now();

    var activeOpt = dailyCodeService.current(employee.getHotel().getId());
    DailyCode active = activeOpt.orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Code expiré ou introuvable"));

    String normalized = code == null ? "" : code.trim().toUpperCase();
    if (!active.getCode().equals(normalized)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Code invalide");
    }

    if (attRepo.existsByEmployeeIdAndCheckOutAtIsNull(employee.getId()))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Pointage déjà ouvert");

    var att = Attendance.builder()
        .employee(employee)
        .date(now.toLocalDate())
        .checkInAt(now)
        .status(Attendance.Status.PRESENT)
        .source("QR")
        .lat(lat).lng(lng)
        .createdBy(employee)
        .createdAt(now)
        .build();

    return attRepo.save(att);
  }

   @Transactional
    public CheckOutResponse checkOut(User employee) {
        var open = attRepo
            .findFirstByEmployeeIdAndCheckOutAtIsNullOrderByCheckInAtDesc(employee.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucun pointage ouvert"));

        var now = LocalDateTime.now();
        open.setCheckOutAt(now);

        // Force l’écriture immédiate : utile si tu lis la valeur tout de suite derrière
        attRepo.saveAndFlush(open);

        return new CheckOutResponse(open.getId(), now);
    }

  @Transactional
    public AttendanceDto addManualAttendance(User current, ManualAttendanceRequest req) {
        // Recharger le manager (principal JPA managé)
        User manager = userRepository.findById(current.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (manager.getHotel() == null || manager.getHotel().getId() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Manager sans hôtel");
        }

        // Trouver l’employé et vérifier qu’il appartient au même hôtel
        User employee = userRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employé introuvable"));

        if (employee.getHotel() == null || !manager.getHotel().getId().equals(employee.getHotel().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employé d’un autre hôtel");
        }

        // Règles simples
        if (req.getCheckOutAt() != null && !req.getCheckOutAt().isAfter(req.getCheckInAt())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Sortie doit être après l’entrée");
        }
        if (!req.getDate().equals(req.getCheckInAt().toLocalDate())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "date != date(checkInAt)");
        }
        if (attendanceRepository.existsByEmployeeIdAndCheckOutAtIsNull(employee.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pointage déjà ouvert pour cet employé");
        }

        // Build & save
        Attendance att = Attendance.builder()
                .employee(employee)
                .date(req.getDate())
                .checkInAt(req.getCheckInAt())
                .checkOutAt(req.getCheckOutAt())
                .status(Attendance.Status.valueOf(req.getStatus()))  // String -> enum
                .source(req.getSource() == null ? "MANUAL" : req.getSource())
                .lat(req.getLat())
                .lng(req.getLng())
                .createdBy(manager)
                .createdAt(LocalDateTime.now())                      // évite NOT NULL
                .build();

        Attendance saved = attendanceRepository.save(att);
        return AttendanceDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> listAttendances(User current, LocalDate start, LocalDate end) {
        if (current.getHotel() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Utilisateur sans hôtel");
        }
        return attendanceRepository
                .findByEmployeeHotelIdAndDateBetween(current.getHotel().getId(), start, end)
                .stream()
                .map(AttendanceDto::from) // ✅ record immuable
                .toList();
    }

    @Transactional
    public AttendanceDto checkoutAttendanceByManager(Long attendanceId, User manager) {
        Attendance att = attRepo.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pointage introuvable"));

        // Vérifier que l'employé appartient au même hôtel
        if (!att.getEmployee().getHotel().getId().equals(manager.getHotel().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employé d’un autre hôtel");
        }

        if (att.getCheckOutAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pointage déjà fermé");
        }

        att.setCheckOutAt(LocalDateTime.now());
        Attendance saved = attRepo.save(att);
        return AttendanceDto.from(saved);
    }

    @Transactional
    public void deleteAttendance(Long attendanceId, User manager) {
        Attendance att = attRepo.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pointage introuvable"));

        // Vérification hôtel
        if (!att.getEmployee().getHotel().getId().equals(manager.getHotel().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Employé d’un autre hôtel");
        }

        attRepo.delete(att);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> listMine(User current, LocalDate start, LocalDate end) {
        return attendanceRepository
                .findByEmployeeIdAndDateBetween(current.getId(), start, end)
                .stream()
                .map(AttendanceDto::from)
                .toList();
    }


    

  
}
