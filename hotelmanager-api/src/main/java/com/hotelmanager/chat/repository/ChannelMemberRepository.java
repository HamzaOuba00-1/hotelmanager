package com.hotelmanager.chat.repository;

import com.hotelmanager.chat.entity.ChannelMember;
import com.hotelmanager.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {

  List<ChannelMember> findAllByUser_Id(Long userId);

  Optional<ChannelMember> findByChannel_IdAndUser_Id(Long channelId, Long userId);

  boolean existsByChannel_IdAndUser_Id(Long channelId, Long userId);

  @Modifying
  @Query("delete from ChannelMember m where m.channel.id = :channelId")
  void deleteByChannelId(@Param("channelId") Long channelId);

  @Query("select u from ChannelMember cm join cm.user u where cm.channel.id = :channelId")
  List<User> findUsersByChannelId(@Param("channelId") Long channelId);
}
