package com.hotelmanager.issue.service;

import com.hotelmanager.hotel.entity.Hotel;
import com.hotelmanager.issue.dto.IssueRequest;
import com.hotelmanager.issue.dto.IssueResponse;
import com.hotelmanager.issue.dto.IssueStatusUpdateRequest;
import com.hotelmanager.user.entity.User;
import com.hotelmanager.issue.entity.Issue;
import com.hotelmanager.issue.entity.IssueStatus;
import com.hotelmanager.issue.repository.IssueRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    /**
     * Création d’un signalement par un employé ou manager.
     */
    @Transactional
    public IssueResponse createIssue(IssueRequest request, User currentUser) {
        Hotel hotel = currentUser.getHotel();
        if (hotel == null) {
            throw new IllegalStateException("L'utilisateur n'est pas associé à un hôtel.");
        }

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setImportant(request.isImportant());
        issue.setStatus(IssueStatus.OPEN);
        issue.setCreatedBy(currentUser);
        issue.setHotel(hotel);

        Issue saved = issueRepository.save(issue);
        return IssueResponse.from(saved);
    }

    /**
     * Récupère tous les signalements de l’hôtel de l’utilisateur (sauf DELETED).
     */
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesForMyHotel(User currentUser) {
        Hotel hotel = currentUser.getHotel();
        if (hotel == null) {
            throw new IllegalStateException("L'utilisateur n'est pas associé à un hôtel.");
        }

        return issueRepository
                .findByHotelIdAndStatusNot(hotel.getId(), IssueStatus.DELETED)
                .stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les signalements d’un hôtel spécifique (pour un manager).
     */
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByHotel(Long hotelId) {
        return issueRepository
                .findByHotelIdAndStatusNot(hotelId, IssueStatus.DELETED)
                .stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un signalement par ID, avec contrôle d’appartenance à l’hôtel de l’utilisateur.
     */
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id, User currentUser) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue non trouvée"));

        checkSameHotel(issue, currentUser);

        if (issue.getStatus() == IssueStatus.DELETED) {
            throw new RuntimeException("Issue supprimée.");
        }

        return IssueResponse.from(issue);
    }

    /**
     * Mise à jour de l’état (RESOLVED / DELETED / etc.) et éventuellement du flag important.
     * Typiquement réservée au MANAGER.
     */
    @Transactional
    public IssueResponse updateStatus(Long id, IssueStatusUpdateRequest statusRequest, User manager) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue non trouvée"));

        checkSameHotel(issue, manager);

        // MAJ de l’état
        if (statusRequest.getStatus() != null) {
            issue.setStatus(statusRequest.getStatus());

            if (statusRequest.getStatus() == IssueStatus.RESOLVED) {
                issue.setResolvedAt(LocalDateTime.now());
            } else if (statusRequest.getStatus() == IssueStatus.OPEN) {
                issue.setResolvedAt(null);
            }
        }

        // MAJ de l’importance si fourni
        if (statusRequest.getImportant() != null) {
            issue.setImportant(statusRequest.getImportant());
        }

        Issue saved = issueRepository.save(issue);
        return IssueResponse.from(saved);
    }

    /**
     * "Suppression" logique : on passe le status à DELETED.
     */
    @Transactional
    public void softDelete(Long id, User manager) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue non trouvée"));

        checkSameHotel(issue, manager);

        issue.setStatus(IssueStatus.DELETED);
        issue.setResolvedAt(LocalDateTime.now());
        issueRepository.save(issue);
    }

    /**
     * Sécurité métier : on empêche un user d’un autre hôtel d’accéder aux issues.
     */
    private void checkSameHotel(Issue issue, User user) {
        Hotel userHotel = user.getHotel();
        if (userHotel == null || issue.getHotel() == null) {
            throw new RuntimeException("Utilisateur ou issue sans hôtel.");
        }

        if (!issue.getHotel().getId().equals(userHotel.getId())) {
            throw new RuntimeException("Accès refusé : issue d’un autre hôtel.");
        }
    }
}
