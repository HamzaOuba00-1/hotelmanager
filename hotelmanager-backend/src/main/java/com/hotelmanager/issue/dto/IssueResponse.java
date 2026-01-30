package com.hotelmanager.issue.dto;

import com.hotelmanager.issue.entity.Issue;
import com.hotelmanager.issue.entity.IssueStatus;

import java.time.LocalDateTime;

public class IssueResponse {

    private Long id;
    private String title;
    private String description;
    private boolean important;
    private IssueStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private Long hotelId;
    private Long createdById;
    private String createdByName;

    public IssueResponse() {
    }

    public IssueResponse(Long id, String title, String description, boolean important,
                         IssueStatus status, LocalDateTime createdAt, LocalDateTime updatedAt,
                         LocalDateTime resolvedAt, Long hotelId, Long createdById, String createdByName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.important = important;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
        this.hotelId = hotelId;
        this.createdById = createdById;
        this.createdByName = createdByName;
    }

    public static IssueResponse from(Issue issue) {
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.isImportant(),
                issue.getStatus(),
                issue.getCreatedAt(),
                issue.getUpdatedAt(),
                issue.getResolvedAt(),
                issue.getHotel() != null ? issue.getHotel().getId() : null,
                issue.getCreatedBy() != null ? issue.getCreatedBy().getId() : null,
                issue.getCreatedBy() != null
                        ? issue.getCreatedBy().getFirstName() + " " + issue.getCreatedBy().getLastName()
                        : null
        );
    }


    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isImportant() {
        return important;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImportant(boolean important) {
        this.important = important;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
}
