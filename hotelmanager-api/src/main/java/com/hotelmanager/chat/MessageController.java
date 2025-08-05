package com.hotelmanager.chat;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/groups/{groupId}/messages")
@CrossOrigin(origins = "http://localhost:3000") // autorise le frontend React
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // Envoyer un message dans un groupe
    @PostMapping
    public ResponseEntity<Message> sendMessage(@PathVariable Long groupId, @RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(groupId, request.getSenderId(), request.getContent());
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    // Récupérer tous les messages d’un groupe
    @GetMapping
    public List<Message> getMessages(@PathVariable Long groupId) {
        return messageService.getMessagesForGroup(groupId);
    }
}

