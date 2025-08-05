package com.hotelmanager.chat;

import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          ChatGroupRepository chatGroupRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.chatGroupRepository = chatGroupRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Message sendMessage(Long groupId, Long senderId, String content) {
        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Groupe non trouvé"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        if (!group.getMembers().contains(sender)) {
            throw new IllegalArgumentException("L'utilisateur n'est pas membre du groupe");
        }

        Message message = new Message();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public List<Message> getMessagesForGroup(Long groupId) {
        return messageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }
}

