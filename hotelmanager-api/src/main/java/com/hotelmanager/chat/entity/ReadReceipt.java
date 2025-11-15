package com.hotelmanager.chat.entity;

import com.hotelmanager.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="read_receipts", indexes = {
  @Index(name="ix_receipt_message", columnList="message_id"),
  @Index(name="ix_receipt_user", columnList="user_id")
})
public class ReadReceipt {
  @EmbeddedId
  private ReadReceiptId id;

  @ManyToOne(optional=false) @MapsId("messageId")
  @JoinColumn(name="message_id")
  private Message message;

  @ManyToOne(optional=false) @MapsId("userId")
  @JoinColumn(name="user_id")
  private User user;

  @Column(nullable=false, updatable=false)
  private Instant readAt = Instant.now();

  public ReadReceipt() {}
  public ReadReceipt(Message m, User u) {
    this.message=m; this.user=u; this.id=new ReadReceiptId(m.getId(), u.getId());
  }
    public ReadReceiptId getId() { return id; }
    public void setId(ReadReceiptId id) { this.id = id; }
    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt;}
}
