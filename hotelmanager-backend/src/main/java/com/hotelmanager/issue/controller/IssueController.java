package com.hotelmanager.issue.controller;

import com.hotelmanager.issue.dto.IssueRequest;
import com.hotelmanager.issue.dto.IssueResponse;
import com.hotelmanager.issue.dto.IssueStatusUpdateRequest;
import com.hotelmanager.user.entity.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.hotelmanager.issue.service.IssueService;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    /* ──────────────── CREATE ──────────────── */

    /**
     * Création d’un signalement par un employé ou un manager.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public ResponseEntity<IssueResponse> createIssue(
            @RequestBody IssueRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        IssueResponse response = issueService.createIssue(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /* ──────────────── READ ──────────────── */

    /**
     * Tous les signalements de l’hôtel de l’utilisateur connecté.
     * (Employé ou manager)
     */
    @GetMapping("/my-hotel")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public List<IssueResponse> getIssuesForMyHotel(
            @AuthenticationPrincipal User currentUser
    ) {
        return issueService.getIssuesForMyHotel(currentUser);
    }

    /**
     * Signalements d’un hôtel spécifique.
     * Réservé au MANAGER (admin d’hôtel).
     */
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('MANAGER')")
    public List<IssueResponse> getIssuesByHotel(@PathVariable Long hotelId) {
        return issueService.getIssuesByHotel(hotelId);
    }

    /**
     * Détail d’un signalement (contrôle d’appartenance à l’hôtel).
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','MANAGER')")
    public ResponseEntity<IssueResponse> getIssueById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        IssueResponse response = issueService.getIssueById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    /* ──────────────── UPDATE STATE ──────────────── */

    /**
     * Mise à jour de l’état et/ou importance.
     * Exemples :
     * - { "status": "RESOLVED" }
     * - { "status": "DELETED" }
     * - { "important": true }
     * - { "status": "OPEN", "important": false }
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<IssueResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody IssueStatusUpdateRequest statusRequest,
            @AuthenticationPrincipal User manager
    ) {
        IssueResponse response = issueService.updateStatus(id, statusRequest, manager);
        return ResponseEntity.ok(response);
    }

    /* ──────────────── DELETE (soft) ──────────────── */

    /**
     * Soft delete : on met l’issue en status DELETED.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager
    ) {
        issueService.softDelete(id, manager);
        return ResponseEntity.noContent().build();
    }
}
