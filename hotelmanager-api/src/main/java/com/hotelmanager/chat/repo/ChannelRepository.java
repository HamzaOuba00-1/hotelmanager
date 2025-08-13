// src/main/java/com/hotelmanager/chat/repo/ChannelRepository.java
package com.hotelmanager.chat.repo;

import com.hotelmanager.chat.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
  List<Channel> findAllByHotelId(Long hotelId);
  Optional<Channel> findByIdAndHotelId(Long id, Long hotelId);
}
