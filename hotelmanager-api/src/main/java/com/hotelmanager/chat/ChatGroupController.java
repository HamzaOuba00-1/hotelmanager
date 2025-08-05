package com.hotelmanager.chat;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/groups")
@CrossOrigin(origins = "http://localhost:3000") // autorise le frontend React
public class ChatGroupController {

    private final ChatGroupService chatGroupService;

    public ChatGroupController(ChatGroupService chatGroupService) {
        this.chatGroupService = chatGroupService;
    }

    // Créer un groupe
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    public ResponseEntity<ChatGroup> createGroup(@RequestBody CreateGroupRequest request) {
        ChatGroup group = chatGroupService.createGroup(
                request.getName(),
                request.getCreatorId(),
                request.getMemberIds()
        );
        return new ResponseEntity<>(group, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ChatGroup> getAllGroups() {
        return chatGroupService.getAllGroups();
    }

    // Récupérer tous les groupes d’un utilisateur
    @GetMapping("/user/{userId}")
    public List<ChatGroup> getGroupsForUser(@PathVariable Long userId) {
        return chatGroupService.getGroupsByUser(userId);
    }
}

