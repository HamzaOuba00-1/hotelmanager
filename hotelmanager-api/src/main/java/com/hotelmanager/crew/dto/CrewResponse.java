package com.hotelmanager.crew.dto;

import com.hotelmanager.crew.entity.Crew;
import com.hotelmanager.crew.entity.ServiceType;
import com.hotelmanager.user.entity.User;

import java.util.List;

public record CrewResponse(
    Long id,
    String name,
    ServiceType service,
    Long hotelId,
    int memberCount,
    List<MemberDTO> members
) {
    public static CrewResponse from(Crew c) {
        return new CrewResponse(
            c.getId(),
            c.getName(),
            c.getService(),
            c.getHotel() != null ? c.getHotel().getId() : null,
            c.getMembers() != null ? c.getMembers().size() : 0,
            c.getMembers().stream().map(MemberDTO::from).toList()
        );
    }

    public record MemberDTO(Long id, String firstName, String lastName, String role) {
        public static MemberDTO from(User u) {
            return new MemberDTO(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole() != null ? u.getRole().name() : null
            );
        }
    }
}
