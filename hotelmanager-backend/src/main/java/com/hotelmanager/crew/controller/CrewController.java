package com.hotelmanager.crew.controller;

import com.hotelmanager.crew.dto.CrewCreateRequest;
import com.hotelmanager.crew.dto.CrewRequest;
import com.hotelmanager.crew.dto.CrewResponse;

import com.hotelmanager.crew.service.CrewService;
import com.hotelmanager.user.entity.User;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/crews")
@PreAuthorize("hasRole('MANAGER')")
public class CrewController {

    private final CrewService crewService;

    public CrewController(CrewService crewService) {
        this.crewService = crewService;
    }

    @GetMapping
    public List<CrewResponse> list(@AuthenticationPrincipal User manager) {
        return crewService.listByHotel(manager.getHotel().getId()).stream()
                .map(CrewResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<CrewResponse> create(@Valid @RequestBody CrewCreateRequest req,
                                            @AuthenticationPrincipal User manager) {
        var created = crewService.create(req, manager);
        return ResponseEntity.created(URI.create("/crews/" + created.getId()))
                .body(CrewResponse.from(created));
    }


    @GetMapping("/{id}")
    public CrewResponse getOne(@PathVariable Long id,
                               @AuthenticationPrincipal User manager) {
        return CrewResponse.from(crewService.getOneForManager(id, manager));
    }

    @PutMapping("/{id}")
    public CrewResponse update(@PathVariable Long id,
                               @Valid @RequestBody CrewRequest req,
                               @AuthenticationPrincipal User manager) {
        return CrewResponse.from(crewService.update(id, req, manager));
    }

    @PostMapping("/{id}/members")
    public CrewResponse addMembers(@PathVariable Long id,
                                   @RequestBody List<Long> memberIds,
                                   @AuthenticationPrincipal User manager) {
        return CrewResponse.from(crewService.addMembers(id, memberIds, manager));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public CrewResponse removeMember(@PathVariable Long id,
                                     @PathVariable Long userId,
                                     @AuthenticationPrincipal User manager) {
        return CrewResponse.from(crewService.removeMember(id, userId, manager));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User manager) {
        crewService.delete(id, manager);
        return ResponseEntity.noContent().build();
    }
}
