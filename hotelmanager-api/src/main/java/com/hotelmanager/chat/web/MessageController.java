package com.hotelmanager.chat.web;

import com.hotelmanager.chat.dto.MessageResponse;
import com.hotelmanager.chat.dto.MessageSendRequest;
import com.hotelmanager.chat.entity.Message;
import com.hotelmanager.chat.service.MessageService;
import com.hotelmanager.user.User;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/channels/{channelId}/messages")
public class MessageController {
  private final MessageService messageService;
  public MessageController(MessageService messageService){ this.messageService=messageService; }

  @GetMapping
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public List<MessageResponse> list(@PathVariable Long channelId,
                                    @RequestParam(defaultValue="50") int limit,
                                    @AuthenticationPrincipal User me) {
    List<Message> msgs = messageService.lastMessages(channelId, Math.min(200, Math.max(1, limit)), me);
    return msgs.stream().map(MessageResponse::from).toList();
  }

  @PostMapping
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public MessageResponse send(@PathVariable Long channelId,
                              @Valid @RequestBody MessageSendRequest req,
                              @AuthenticationPrincipal User me) {
    return MessageResponse.from(messageService.post(channelId, req, me));
  }
}
