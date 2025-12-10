package com.hotelmanager.chat.security;

import com.hotelmanager.chat.repo.ChannelMemberRepository;
import com.hotelmanager.user.User;
import org.springframework.stereotype.Component;

@Component("chatAuth")
public class ChatAuthorization {
  private final ChannelMemberRepository memberRepo;

  public ChatAuthorization(ChannelMemberRepository memberRepo) {
    this.memberRepo = memberRepo;
  }

  public boolean isMember(Long channelId, User user) {
    if (user == null) return false;
    return memberRepo.findByChannel_IdAndUser_Id(channelId, user.getId()).isPresent();
  }
}

