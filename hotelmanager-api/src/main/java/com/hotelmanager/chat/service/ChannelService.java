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
import com.hotelmanager.user.Role;
import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import com.hotelmanager.user.dto.UserShortDto;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class ChannelService {

  private final ChannelRepository channelRepo;
  private final ChannelMemberRepository memberRepo;
  private final UserRepository userRepo;
  private final CrewRepository crewRepo;

  private static final String CLIENT_SUPPORT_SERVICE = "CLIENT_SUPPORT";

  public ChannelService(
      ChannelRepository channelRepo,
      ChannelMemberRepository memberRepo,
      UserRepository userRepo,
      CrewRepository crewRepo
  ) {
    this.channelRepo = channelRepo;
    this.memberRepo = memberRepo;
    this.userRepo = userRepo;
    this.crewRepo = crewRepo;
  }

  // =========================
  // ✅ CLIENT SUPPORT
  // =========================
  @Transactional
  public Channel getOrCreateClientSupport(User client) {
    if (client.getHotel() == null) {
      throw new IllegalArgumentException("Utilisateur sans hôtel.");
    }

    Long hotelId = client.getHotel().getId();

    // 1) chercher tous les canaux existants (tolérant aux doublons)
    List<Channel> existing = channelRepo
        .findAllByHotel_IdAndTypeAndServiceAndCreatedBy_Id(
            hotelId,
            ChannelType.DIRECT,
            CLIENT_SUPPORT_SERVICE,
            client.getId()
        );

    if (!existing.isEmpty()) {
      // ✅ garder le plus récent
      Channel keep = existing.stream()
          .max(Comparator.comparing(Channel::getCreatedAt))
          .orElse(existing.get(0));

      // ✅ optionnel mais recommandé : cleanup des doublons
      for (Channel c : existing) {
        if (!c.getId().equals(keep.getId())) {
          memberRepo.deleteByChannelId(c.getId());
          channelRepo.delete(c);
        }
      }
      return keep;
    }

    // 2) récupérer tous les managers de l’hôtel
    List<User> managers = userRepo.findAllByHotel_IdAndRole(hotelId, Role.MANAGER);
    if (managers.isEmpty()) {
      throw new IllegalArgumentException("Aucun manager trouvé dans cet hôtel.");
    }

    // 3) créer le channel
    Channel c = new Channel();
    c.setHotel(client.getHotel());
    c.setType(ChannelType.DIRECT);
    c.setService(CLIENT_SUPPORT_SERVICE);
    c.setName("Contact Hôtel");
    c.setCreatedBy(client);
    c.setCreatedAt(Instant.now());

    c = channelRepo.save(c);

    // 4) membres uniques = client + managers
    LinkedHashSet<Long> userIds = new LinkedHashSet<>();
    userIds.add(client.getId());
    managers.forEach(m -> userIds.add(m.getId()));

    List<User> found = userRepo.findAllById(userIds);

    for (User u : found) {
      ChannelRole role = u.getId().equals(client.getId())
          ? ChannelRole.OWNER
          : ChannelRole.MEMBER;

      if (!memberRepo.existsByChannel_IdAndUser_Id(c.getId(), u.getId())) {
        try {
          memberRepo.save(new ChannelMember(c, u, role));
        } catch (DataIntegrityViolationException ignored) {}
      }
    }

    return c;
  }

  // =========================
  // ✅ LIST / GET
  // =========================
  public List<Channel> listMy(User me) {
    Long hotelId = me.getHotel().getId();
    return channelRepo.findAllByHotelId(hotelId).stream()
        .filter(c -> memberRepo.findByChannel_IdAndUser_Id(c.getId(), me.getId()).isPresent()
)
        .toList();
  }

  public Channel getForHotel(Long id, User me) {
    return channelRepo.findByIdAndHotelId(id, me.getHotel().getId())
        .orElseThrow(() -> new IllegalArgumentException("Channel introuvable."));
  }

  public int countMembers(Long channelId) {
    return memberRepo.findUsersByChannelId(channelId).size();
  }

  // =========================
  // ✅ CREATE (MANAGER)
  // =========================
  @Transactional
  public Channel create(ChannelCreateRequest req, User principal) {
    if (principal.getHotel() == null) {
      throw new IllegalArgumentException("Utilisateur sans hôtel.");
    }
    Long hotelId = principal.getHotel().getId();

    if (req.type() == ChannelType.CREW) {
      if (req.crewId() == null)
        throw new IllegalArgumentException("crewId requis pour une chaîne CREW.");
    } else {
      if (req.memberIds() == null || req.memberIds().isEmpty()) {
        throw new IllegalArgumentException("memberIds requis pour une chaîne DIRECT/ANNOUNCEMENT.");
      }
    }

    Channel c = new Channel();
    c.setType(req.type());
    c.setName(req.name().trim());
    c.setService(req.service());
    c.setIcon(req.icon());
    c.setHotel(principal.getHotel());
    c.setCreatedBy(principal);
    c.setCreatedAt(Instant.now());

    if (req.type() == ChannelType.CREW) {
      Crew crew = crewRepo.findByIdAndHotelId(req.crewId(), hotelId)
          .orElseThrow(() -> new IllegalArgumentException("Crew introuvable pour votre hôtel."));
      c.setCrew(crew);
    }

    c = channelRepo.save(c);

    LinkedHashSet<Long> userIdsToAdd = new LinkedHashSet<>();

    if (req.type() == ChannelType.CREW) {
      Crew crew = c.getCrew();
      crew.getMembers().forEach(u -> userIdsToAdd.add(u.getId()));
      userIdsToAdd.add(principal.getId());
    } else {
      userIdsToAdd.addAll(req.memberIds());
      userIdsToAdd.add(principal.getId());
    }

    List<User> found = userRepo.findAllById(userIdsToAdd);
    if (found.size() != userIdsToAdd.size()) {
      throw new IllegalArgumentException("Certains utilisateurs n'existent pas.");
    }
    for (User u : found) {
      if (u.getHotel() == null || !u.getHotel().getId().equals(hotelId)) {
        throw new IllegalArgumentException("Tous les membres doivent appartenir à l'hôtel.");
      }
    }

    for (Long uid : userIdsToAdd) {
      if (!memberRepo.existsByChannel_IdAndUser_Id(c.getId(), uid)) {
        User u = found.stream().filter(x -> x.getId().equals(uid)).findFirst().orElseThrow();
        ChannelRole role = uid.equals(principal.getId()) ? ChannelRole.OWNER : ChannelRole.MEMBER;
        try {
          memberRepo.save(new ChannelMember(c, u, role));
        } catch (DataIntegrityViolationException ignored) {}
      }
    }

    return c;
  }

  // =========================
  // ✅ UPDATE / DELETE
  // =========================
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

  // =========================
  // ✅ MEMBERS
  // =========================
  public List<UserShortDto> listMembers(Long channelId, User me) {
    Channel c = getForHotel(channelId, me);
    return memberRepo.findUsersByChannelId(c.getId())
        .stream()
        .map(UserShortDto::from)
        .toList();
  }
}
