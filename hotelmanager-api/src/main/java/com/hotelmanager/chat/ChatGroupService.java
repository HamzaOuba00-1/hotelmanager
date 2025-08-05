package com.hotelmanager.chat;

import com.hotelmanager.user.User;
import com.hotelmanager.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatGroupService {

    private final ChatGroupRepository chatGroupRepository;
    private final UserRepository userRepository;

    public ChatGroupService(ChatGroupRepository chatGroupRepository, UserRepository userRepository) {
        this.chatGroupRepository = chatGroupRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChatGroup createGroup(String name, Long creatorId, List<Long> memberIds) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Créateur non trouvé"));

        List<User> members = userRepository.findAllById(memberIds);

        ChatGroup group = new ChatGroup();
        group.setName(name);
        group.setCreatedBy(creator);
        group.setMembers(members);
        group.setCreatedAt(LocalDateTime.now());

        return chatGroupRepository.save(group);
    }

    public List<ChatGroup> getGroupsByUser(Long userId) {
        return chatGroupRepository.findByMembers_Id(userId);
    }

    public List<ChatGroup> getAllGroups() {
        return chatGroupRepository.findAll();
    }
}

