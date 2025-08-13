// src/main/java/com/hotelmanager/chat/repo/ChannelMemberRepository.java
package com.hotelmanager.chat.repo;

import com.hotelmanager.chat.entity.ChannelMember;
import com.hotelmanager.chat.entity.ChannelMemberId;
import com.hotelmanager.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, ChannelMemberId> {
  boolean existsById(ChannelMemberId id);
  
  List<ChannelMember> findAllByUserId(Long userId);
  Optional<ChannelMember> findByChannelIdAndUserId(Long channelId, Long userId);
  boolean existsByChannel_IdAndUser_Id(Long channelId, Long userId);

  @Modifying
  @Query("delete from ChannelMember m where m.channel.id = :channelId")
  void deleteByChannelId(Long channelId);

  @Query("select u from ChannelMember cm join cm.user u where cm.channel.id = :channelId")
  List<User> findUsersByChannelId(@Param("channelId") Long channelId);
}
