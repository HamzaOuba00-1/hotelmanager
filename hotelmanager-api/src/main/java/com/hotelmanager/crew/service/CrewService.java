package com.hotelmanager.crew.service;

import com.hotelmanager.crew.dto.CrewCreateRequest;
import com.hotelmanager.crew.dto.CrewRequest;
import com.hotelmanager.crew.entity.Crew;
import com.hotelmanager.crew.repository.CrewRepository;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.user.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
public class CrewService {
    private final CrewRepository crewRepository;
    private final UserRepository userRepository;

    public CrewService(CrewRepository crewRepository, UserRepository userRepository) {
        this.crewRepository = crewRepository;
        this.userRepository = userRepository;
    }

    public List<Crew> listByHotel(Long hotelId) {
        return crewRepository.findAllByHotelId(hotelId);
    }

    @Transactional
    public Crew create(CrewCreateRequest req, User manager) {
        Long hotelId = manager.getHotel().getId();
        if (crewRepository.existsByNameIgnoreCaseAndHotelId(req.getName(), hotelId)) {
            throw new IllegalArgumentException("Un crew avec ce nom existe déjà dans cet hôtel.");
        }
        Crew crew = new Crew(req.getName(), req.getService(), manager.getHotel());
        if (req.getMemberIds() != null && !req.getMemberIds().isEmpty()) {
            var users = userRepository.findAllById(req.getMemberIds());
            var sameHotel = users.stream()
                    .filter(u -> u.getHotel() != null && u.getHotel().getId().equals(hotelId))
                    .toList();
            if (sameHotel.size() != req.getMemberIds().size()) {
                throw new IllegalArgumentException("Certains utilisateurs ne font pas partie de votre hôtel.");
            }
            crew.setMembers(new HashSet<>(sameHotel));
        }
        return crewRepository.save(crew);
    }

    @Transactional
    public Crew update(Long crewId, CrewRequest req, User manager) {
        Crew crew = getOneForManager(crewId, manager);

        if (req.getName() != null && !req.getName().isBlank()) {
            if (!crew.getName().equalsIgnoreCase(req.getName())
                    && crewRepository.existsByNameIgnoreCaseAndHotelId(req.getName(), manager.getHotel().getId())) {
                throw new IllegalArgumentException("Un crew avec ce nom existe déjà dans cet hôtel.");
            }
            crew.setName(req.getName());
        }
        if (req.getService() != null) {
            crew.setService(req.getService());
        }
        if (req.getMemberIds() != null) {
            var users = userRepository.findAllById(req.getMemberIds());
            var sameHotel = users.stream()
                    .filter(u -> u.getHotel() != null && u.getHotel().getId().equals(manager.getHotel().getId()))
                    .toList();
            if (sameHotel.size() != req.getMemberIds().size()) {
                throw new IllegalArgumentException("Certains utilisateurs ne font pas partie de votre hôtel.");
            }
            crew.setMembers(new HashSet<>(sameHotel));
        }
        return crew;
    }

    public Crew getOneForManager(Long crewId, User manager) {
        return crewRepository.findByIdAndHotelId(crewId, manager.getHotel().getId())
                .orElseThrow(() -> new IllegalArgumentException("Crew introuvable pour votre hôtel."));
    }

    @Transactional
    public Crew addMembers(Long crewId, List<Long> memberIds, User manager) {
        Crew crew = getOneForManager(crewId, manager);
        var users = userRepository.findAllById(memberIds);
        users.stream()
                .filter(u -> u.getHotel() != null && u.getHotel().getId().equals(manager.getHotel().getId()))
                .forEach(u -> crew.getMembers().add(u));
        return crew;
    }

    @Transactional
    public Crew removeMember(Long crewId, Long userId, User manager) {
        Crew crew = getOneForManager(crewId, manager);
        crew.getMembers().removeIf(u -> u.getId().equals(userId));
        return crew;
    }

    public void delete(Long crewId, User manager) {
        Crew crew = getOneForManager(crewId, manager);
        crewRepository.deleteById(crew.getId());
    }

}
