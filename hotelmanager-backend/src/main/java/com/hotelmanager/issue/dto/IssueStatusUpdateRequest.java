package com.hotelmanager.issue.dto;

import com.hotelmanager.issue.entity.IssueStatus;

public class IssueStatusUpdateRequest {

    private IssueStatus status;
    private Boolean important; 

    public IssueStatusUpdateRequest() {
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public Boolean getImportant() {
        return important;
    }

    public void setImportant(Boolean important) {
        this.important = important;
    }

    @Override
    public String toString() {
        return "IssueStatusUpdateRequest{" +
                "status=" + status +
                ", important=" + important +
                '}';
    }
}
