package com.hotelmanager.crew.dto;

import com.hotelmanager.crew.ServiceType;
import java.util.List;

public class CrewUpdateRequest {
  private String name;              
  private ServiceType service;      
  private List<Long> memberIds;     

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public ServiceType getService() { return service; }
  public void setService(ServiceType service) { this.service = service; }

  public List<Long> getMemberIds() { return memberIds; }
  public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
}
