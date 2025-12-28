package com.hotelmanager.chat.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ChannelMemberId implements Serializable {
  private Long channelId;
  private Long userId;

  public ChannelMemberId() {}
  public ChannelMemberId(Long channelId, Long userId) {
    this.channelId = channelId; this.userId = userId;
  }
    public Long getChannelId() { return channelId; }
    public void setChannelId(Long channelId) { this.channelId = channelId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
  @Override public boolean equals(Object o){
    if(this==o) return true;
    if(!(o instanceof ChannelMemberId)) return false;
    ChannelMemberId that=(ChannelMemberId)o;
    return Objects.equals(channelId, that.channelId) && Objects.equals(userId, that.userId);
  }
  @Override public int hashCode(){ return Objects.hash(channelId, userId); }
}
