// src/main/java/com/hotelmanager/chat/Message.java
package com.hotelmanager.chat.entity;

import com.hotelmanager.user.User;
import com.hotelmanager.chat.model.MessageType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_message_channel"))
    private Channel channel;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User sender;

    @CreationTimestamp
    private Instant createdAt;

    private Instant editedAt;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false)
    private boolean softDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MessageType type = MessageType.TEXT;

    // getters/setters



  // getters/setters…
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getEditedAt() { return editedAt; }
    public void setEditedAt(Instant editedAt) { this.editedAt = editedAt; }
    public boolean isSoftDeleted() { return softDeleted; }
    public void setSoftDeleted(boolean softDeleted) { this.softDeleted = softDeleted; }

}
