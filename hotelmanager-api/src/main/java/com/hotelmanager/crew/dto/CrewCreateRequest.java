package com.hotelmanager.crew.dto;

import com.hotelmanager.crew.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CrewCreateRequest {
  @NotBlank
  private String name;

  @NotNull
  private ServiceType service;

  private List<Long> memberIds;

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public ServiceType getService() { return service; }
  public void setService(ServiceType service) { this.service = service; }

  public List<Long> getMemberIds() { return memberIds; }
  public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
}
