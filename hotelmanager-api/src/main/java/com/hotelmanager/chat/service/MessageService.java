// src/main/java/com/hotelmanager/chat/service/MessageService.java
package com.hotelmanager.chat.service;

import com.hotelmanager.chat.dto.MessageSendRequest;
import com.hotelmanager.chat.entity.Channel;
import com.hotelmanager.chat.entity.Message;
import com.hotelmanager.chat.model.MessageType;
import com.hotelmanager.chat.repo.MessageRepository;
import com.hotelmanager.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.hotelmanager.chat.dto.MessageResponse;

import java.util.List;

@Service
public class MessageService {
  private final MessageRepository messageRepo;
  private final ChannelService channelService;
  private final SimpMessagingTemplate messaging;

  public MessageService(MessageRepository messageRepo, ChannelService channelService,
                        SimpMessagingTemplate messaging) {
    this.messageRepo = messageRepo; this.channelService=channelService; this.messaging=messaging;
  }

  public List<Message> lastMessages(Long channelId, int limit, User me) {
    Channel c = channelService.getForHotel(channelId, me);
    return messageRepo.findRecentWithSender(c.getId(), PageRequest.of(0, limit));
  }

  @Transactional
  public Message post(Long channelId, MessageSendRequest req, User me) {
    Channel c = channelService.getForHotel(channelId, me);
    // ici on suppose que l’appartenance est garantie par @PreAuthorize au contrôleur
    Message m = new Message();
    m.setChannel(c);
    m.setSender(me);
    m.setType(MessageType.TEXT);
    m.setContent(req.content());
    messageRepo.save(m);

    // broadcast temps réel
    messaging.convertAndSend("/topic/channel." + channelId, MessageResponse.from(m));
    return m;
  }
}
