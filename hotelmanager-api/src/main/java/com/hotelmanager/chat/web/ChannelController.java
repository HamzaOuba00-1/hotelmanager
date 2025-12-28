package com.hotelmanager.chat.web;

import com.hotelmanager.chat.dto.*;
import com.hotelmanager.chat.entity.Channel;
import com.hotelmanager.chat.service.ChannelService;
import com.hotelmanager.user.dto.UserShortDto;
import com.hotelmanager.user.entity.User;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/channels")
public class ChannelController {
  private final ChannelService channelService;
  public ChannelController(ChannelService channelService){ this.channelService=channelService; }

  @GetMapping
  public List<ChannelResponse> myChannels(@AuthenticationPrincipal User me) {
    return channelService.listMy(me).stream()
      .map(c -> ChannelResponse.from(c, channelService.countMembers(c.getId())))
      .toList();
  }

  @PostMapping
  @PreAuthorize("hasRole('MANAGER')") 
  public ChannelResponse create(@Valid @RequestBody ChannelCreateRequest req,
                                @AuthenticationPrincipal User me) {
    Channel c = channelService.create(req, me);
    return ChannelResponse.from(c, channelService.countMembers(c.getId()));
  }

  @GetMapping("/{channelId}")
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public ChannelResponse getOne(@PathVariable Long channelId,
                                @AuthenticationPrincipal User me) {
    Channel c = channelService.getForHotel(channelId, me);
    return ChannelResponse.from(c, channelService.countMembers(c.getId()));
  }

  @PutMapping("/{channelId}")
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public ChannelResponse update(@PathVariable Long channelId,
                                @RequestBody ChannelUpdateRequest req,
                                @AuthenticationPrincipal User me) {
    Channel c = channelService.update(channelId, req, me);
    return ChannelResponse.from(c, channelService.countMembers(c.getId()));
  }

  @DeleteMapping("/{channelId}")
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public void delete(@PathVariable Long channelId, @AuthenticationPrincipal User me) {
    channelService.deleteChannel(channelId, me);
  }

  @GetMapping("/{channelId}/members")
  @PreAuthorize("@chatAuth.isMember(#channelId, principal)")
  public List<UserShortDto> members(@PathVariable Long channelId,
                                    @AuthenticationPrincipal User me) {
    return channelService.listMembers(channelId, me);
  }

  @PostMapping("/client-support")
  @PreAuthorize("hasRole('CLIENT')")
  public ChannelResponse clientSupport(@AuthenticationPrincipal User me) {
    Channel c = channelService.getOrCreateClientSupport(me);
    return ChannelResponse.from(c, channelService.countMembers(c.getId()));
  }

}
