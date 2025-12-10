package com.hotelmanager.chat.repo;

import com.hotelmanager.chat.entity.Channel;
import com.hotelmanager.chat.model.ChannelType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {

  List<Channel> findAllByHotelId(Long hotelId);
  Optional<Channel> findByIdAndHotelId(Long id, Long hotelId);

  // ✅ Pour support client : tolérant aux doublons
  List<Channel> findAllByHotel_IdAndTypeAndServiceAndCreatedBy_Id(
      Long hotelId,
      ChannelType type,
      String service,
      Long createdById
  );

  // ✅ optionnel : si tu veux une version "safe"
  Optional<Channel> findFirstByHotel_IdAndTypeAndServiceAndCreatedBy_IdOrderByCreatedAtDesc(
      Long hotelId,
      ChannelType type,
      String service,
      Long createdById
  );
}
