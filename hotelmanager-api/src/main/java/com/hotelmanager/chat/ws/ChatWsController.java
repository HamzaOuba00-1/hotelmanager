package com.hotelmanager.chat.ws;

import com.hotelmanager.chat.dto.MessageResponse;
import com.hotelmanager.chat.dto.MessageSendRequest;
import com.hotelmanager.chat.service.MessageService;
import com.hotelmanager.user.User;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWsController {
  private final MessageService messageService;
  public ChatWsController(MessageService messageService){ this.messageService=messageService; }

  @MessageMapping("/channel.{channelId}.send")
  public void send(@DestinationVariable Long channelId,
                   @Valid MessageSendRequest req,
                   @AuthenticationPrincipal User me) {
    messageService.post(channelId, req, me);
  }
}
