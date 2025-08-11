package com.hotelmanager.crew.dto;

import com.hotelmanager.crew.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CrewRequest {
    @NotBlank
    private String name;

    @NotNull
    private ServiceType service;

    // facultatif à la création, sinon géré par endpoints membres
    private List<Long> memberIds;

    // getters/setters…
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ServiceType getService() { return service; }
    public void setService(ServiceType service) { this.service = service; }
    public List<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
}
