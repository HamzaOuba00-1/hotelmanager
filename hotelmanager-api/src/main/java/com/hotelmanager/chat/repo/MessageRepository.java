// src/main/java/com/hotelmanager/chat/repo/MessageRepository.java
package com.hotelmanager.chat.repo;

import com.hotelmanager.chat.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

  @Query("""
         select m
         from Message m
         join fetch m.sender s
         where m.channel.id = :channelId
         order by m.createdAt desc
         """)
  List<Message> findRecentWithSender(@Param("channelId") Long channelId, Pageable pageable);
}
