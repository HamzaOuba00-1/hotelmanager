package com.hotelmanager.chat.entity;

import com.hotelmanager.user.User;
import com.hotelmanager.chat.model.ChannelRole;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "channel_members",
       uniqueConstraints = @UniqueConstraint(name="uk_channel_member", columnNames={"channel_id", "user_id"}))
public class ChannelMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="channel_id", nullable = false,
        foreignKey = @ForeignKey(name="fk_member_channel"))
    private Channel channel;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    private Instant joinedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private ChannelRole roleInChannel = ChannelRole.MEMBER;

    public ChannelMember() {}
    public ChannelMember(Channel c, User u, ChannelRole role) {
      this.channel = c; this.user = u; this.roleInChannel = role;
      this.id =  null; // JPA will generate this
    }

    // getters/setters


  // getters/setters…
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ChannelRole getRoleInChannel() { return roleInChannel; }
    public void setRoleInChannel(ChannelRole roleInChannel) { this.roleInChannel = roleInChannel; }
    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
    
}



