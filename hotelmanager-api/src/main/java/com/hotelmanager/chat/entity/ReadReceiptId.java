// src/main/java/com/hotelmanager/chat/entity/ReadReceiptId.java
package com.hotelmanager.chat.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ReadReceiptId implements Serializable {
  private Long messageId;
  private Long userId;
  public ReadReceiptId() {}
  public ReadReceiptId(Long messageId, Long userId){
    this.messageId=messageId; this.userId=userId;
  }
  @Override public boolean equals(Object o){
    if(this==o) return true;
    if(!(o instanceof ReadReceiptId)) return false;
    ReadReceiptId that=(ReadReceiptId)o;
    return Objects.equals(messageId, that.messageId) && Objects.equals(userId, that.userId);
  }
  @Override public int hashCode(){ return Objects.hash(messageId, userId); }
}
