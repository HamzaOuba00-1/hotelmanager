package com.hotelmanager.crew.dto;

import com.hotelmanager.crew.ServiceType;
import java.util.List;

/** Tous les champs optionnels pour permettre des updates partiels */
public class CrewUpdateRequest {
  private String name;              // null = ne pas changer
  private ServiceType service;      // null = ne pas changer
  private List<Long> memberIds;     // null = ne pas changer

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public ServiceType getService() { return service; }
  public void setService(ServiceType service) { this.service = service; }

  public List<Long> getMemberIds() { return memberIds; }
  public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
}
