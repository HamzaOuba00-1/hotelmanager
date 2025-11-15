package com.hotelmanager.chat.service;

import com.hotelmanager.chat.dto.ChannelCreateRequest;
import com.hotelmanager.chat.dto.ChannelUpdateRequest;
import com.hotelmanager.chat.entity.Channel;
import com.hotelmanager.chat.entity.ChannelMember;
import com.hotelmanager.chat.model.ChannelRole;
import com.hotelmanager.chat.model.ChannelType;
import com.hotelmanager.chat.repo.ChannelMemberRepository;
import com.hotelmanager.chat.repo.ChannelRepository;
import com.hotelmanager.crew.Crew;
import com.hotelmanager.crew.CrewRepository;
import com.hotelmanager.hotel.Hotel;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import com.hotelmanager.user.dto.UserShortDto;
import com.hotelmanager.chat.repo.ChannelMemberRepository;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class ChannelService {
  private final ChannelRepository channelRepo;
  private final ChannelMemberRepository memberRepo;
  private final UserRepository userRepo;
  private final CrewRepository crewRepo;
  private final ChannelRepository channelRepository;
  private ChannelMemberRepository cmRepo;
  private ChannelService channelService;

  public ChannelService(ChannelRepository channelRepo, ChannelMemberRepository memberRepo,
      UserRepository userRepo, CrewRepository crewRepo, ChannelRepository channelRepository) {
    this.channelRepo = channelRepo;
    this.memberRepo = memberRepo;
    this.userRepo = userRepo;
    this.crewRepo = crewRepo;
    this.channelRepository = channelRepository;
    this.channelService = null;

  }

  public List<Channel> listMy(User me) {
    return channelRepo.findAllByHotelId(me.getHotel().getId()).stream()
        .filter(c -> memberRepo.findByChannelIdAndUserId(c.getId(), me.getId()).isPresent())
        .toList();
  }

  public Channel getForHotel(Long id, User me) {
    return channelRepo.findByIdAndHotelId(id, me.getHotel().getId())
        .orElseThrow(() -> new IllegalArgumentException("Channel introuvable."));
  }

  public int countMembers(Long channelId) {
    return memberRepo.findUsersByChannelId(channelId).size();
  }

  @Transactional
  public Channel create(ChannelCreateRequest req, User principal) {
    if (principal.getHotel() == null) {
      throw new IllegalArgumentException("Utilisateur sans hôtel.");
    }
    Long hotelId = principal.getHotel().getId();

    // ---- validations ----
    if (req.type() == ChannelType.CREW) {
      if (req.crewId() == null)
        throw new IllegalArgumentException("crewId requis pour une chaîne CREW.");
    } else { // DIRECT / ANNOUNCEMENT
      if (req.memberIds() == null || req.memberIds().isEmpty()) {
        throw new IllegalArgumentException("memberIds requis pour une chaîne DIRECT/ANNOUNCEMENT.");
      }
    }

    // ---- créer le channel ----
    Channel c = new Channel();
    c.setType(req.type());
    c.setName(req.name().trim());
    c.setService(req.service());
    c.setHotel(principal.getHotel()); // ✅ important
    c.setCreatedBy(principal);
    c.setCreatedAt(Instant.now());

    if (req.type() == ChannelType.CREW) {
      Crew crew = crewRepo.findByIdAndHotelId(req.crewId(), hotelId)
          .orElseThrow(() -> new IllegalArgumentException("Crew introuvable pour votre hôtel."));
      c.setCrew(crew);
    }

    c = channelRepo.save(c);

    // ---- déterminer l’ensemble des membres UNIQUES à ajouter ----
    LinkedHashSet<Long> userIdsToAdd = new LinkedHashSet<>();

    if (req.type() == ChannelType.CREW) {
      Crew crew = c.getCrew();
      crew.getMembers().forEach(u -> userIdsToAdd.add(u.getId()));
      // inclure le manager s'il n'y est pas déjà
      userIdsToAdd.add(principal.getId());
    } else {
      userIdsToAdd.addAll(req.memberIds()); // membres choisis
      userIdsToAdd.add(principal.getId()); // + manager (owner)
    }

    // ---- charger/valider les users (même hôtel) ----
    List<User> found = userRepo.findAllById(userIdsToAdd);
    if (found.size() != userIdsToAdd.size()) {
      throw new IllegalArgumentException("Certains utilisateurs n'existent pas.");
    }
    for (User u : found) {
      if (u.getHotel() == null || !u.getHotel().getId().equals(hotelId)) {
        throw new IllegalArgumentException("Tous les membres doivent appartenir à l'hôtel.");
      }
    }

    // ---- insérer sans doublons ----
    for (Long uid : userIdsToAdd) {
      if (!memberRepo.existsByChannel_IdAndUser_Id(c.getId(), uid)) {
        User u = found.stream().filter(x -> x.getId().equals(uid)).findFirst().orElseThrow();
        ChannelRole role = uid.equals(principal.getId()) ? ChannelRole.OWNER : ChannelRole.MEMBER;
        try {
          memberRepo.save(new ChannelMember(c, u, role));
        } catch (DataIntegrityViolationException e) {
          // en cas de course concurrente, on ignore le doublon
        }
      }
    }

    return c;
  }

  @Transactional
  public Channel update(Long id, ChannelUpdateRequest req, User principal) {
    Channel c = channelRepo.findByIdAndHotelId(id, principal.getHotel().getId())
        .orElseThrow(() -> new EntityNotFoundException("Chaîne introuvable."));
    if (req.name() != null && !req.name().isBlank())
      c.setName(req.name().trim());
    if (req.service() != null)
      c.setService(req.service());
    if (req.icon() != null)
      c.setIcon(req.icon());
    return c;
  }

  @Transactional
  public void deleteChannel(Long id, User principal) {
    Channel c = channelRepo.findByIdAndHotelId(id, principal.getHotel().getId())
        .orElseThrow(() -> new EntityNotFoundException("Chaîne introuvable."));
    
    memberRepo.deleteByChannelId(c.getId());
    channelRepo.delete(c); 
  }
  public void ChannelMemberService(ChannelMemberRepository cmRepo, ChannelService channelService) {
    this.cmRepo = cmRepo; this.channelService = channelService;
  }

  public List<UserShortDto> listMembers(Long channelId, User me) {
    Channel c = channelService.getForHotel(channelId, me); 
    return cmRepo.findUsersByChannelId(c.getId()).stream().map(UserShortDto::from).toList();
  }
}
