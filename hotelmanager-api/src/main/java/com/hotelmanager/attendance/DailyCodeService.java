// src/main/java/com/hotelmanager/attendance/DailyCodeService.java
package com.hotelmanager.attendance;

import com.hotelmanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyCodeService {
  private final DailyCodeRepository repo;

  public DailyCode regenerate(User manager, Duration ttl) {
    var now = LocalDateTime.now();

    // 🚫 Révoquer tous les codes actifs existants pour cet hôtel
    List<DailyCode> actives = repo.findAllActive(manager.getHotel().getId(), now);
    if (!actives.isEmpty()) {
      for (var dc : actives) {
        dc.setRevokedAt(now);
      }
      repo.saveAll(actives);
    }

    // ✅ Créer un nouveau code, valide pendant "ttl" (6h)
    var dc = DailyCode.builder()
        .hotel(manager.getHotel())
        .code(generateCode(6))
        .validFrom(now)
        .validUntil(now.plus(ttl))
        .createdBy(manager)
        .createdAt(LocalDateTime.now())
        .build();
    return repo.save(dc);
  }

  public java.util.Optional<DailyCode> current(Long hotelId) {
    return repo.findActive(hotelId, LocalDateTime.now());
  }

  private static String generateCode(int len) {
    var rnd = new SecureRandom();
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
    return sb.toString();
  }
}
