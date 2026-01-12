package com.hotelmanager.chat.entity;

import com.hotelmanager.hotel.entity.Hotel;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.chat.model.ChannelType;
import com.hotelmanager.crew.entity.Crew;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;


import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "channels")
public class Channel {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Hotel hotel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ChannelType type;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(length = 64)
    private String service;

    @Column(length = 64)
    private String icon;

    @ManyToOne(fetch = FetchType.LAZY)
    private Crew crew;

    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChannelMember> members = new HashSet<>();

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Hotel getHotel() {
        return hotel;
    }
    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }
    public ChannelType getType() {
        return type;
    }
    public void setType(ChannelType type) {
        this.type = type;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getService() {
        return service;
    }
    public void setService(String service) {
        this.service = service;
    }
    public String getIcon() {
        return icon;
    }
    public void setIcon(String icon) {
        this.icon = icon;
    }
    public Crew getCrew() {
        return crew;
    }
    public void setCrew(Crew crew) {
        this.crew = crew;
    }
    public User getCreatedBy() {
        return createdBy;
    }
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    public List<Message> getMessages() {
        return messages;
    }
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }
    public Set<ChannelMember> getMembers() {
        return members;
    }
    public void setMembers(Set<ChannelMember> members) {
        this.members = members;
    }
    
}
