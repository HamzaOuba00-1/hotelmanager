package com.hotelmanager.attendance.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.hotelmanager.attendance.entity.DailyCode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DailyCodeRepository extends JpaRepository<DailyCode, Long> {

  Optional<DailyCode> findFirstByHotelIdAndRevokedAtIsNullAndValidFromLessThanEqualAndValidUntilGreaterThanEqualOrderByValidFromDesc(
      Long hotelId, LocalDateTime now1, LocalDateTime now2);

  @Modifying
  @Transactional
  @Query("""
    update DailyCode d
       set d.revokedAt = :now
     where d.hotel.id = :hotelId
       and d.revokedAt is null
       and :now between d.validFrom and d.validUntil
  """)
  int revokeActive(@Param("hotelId") Long hotelId, @Param("now") LocalDateTime now);

  @Query(value = """
      select * from daily_codes d
       where d.hotel_id = :hotelId
         and d.revoked_at is null
         and :now between d.valid_from and d.valid_until
       order by d.valid_from desc
       limit 1
    """, nativeQuery = true)
    Optional<DailyCode> findActive(@Param("hotelId") Long hotelId, @Param("now") LocalDateTime now);

    @Query(value = """
      select * from daily_codes d
       where d.hotel_id = :hotelId
         and d.revoked_at is null
         and :now between d.valid_from and d.valid_until
    """, nativeQuery = true)
    List<DailyCode> findAllActive(@Param("hotelId") Long hotelId, @Param("now") LocalDateTime now);
}

