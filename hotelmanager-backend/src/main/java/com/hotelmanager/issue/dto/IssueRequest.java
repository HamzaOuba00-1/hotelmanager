package com.hotelmanager.issue.dto;

public class IssueRequest {

    private String title;
    private String description;
    private boolean important;

    public IssueRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isImportant() {
        return important;
    }

    public void setImportant(boolean important) {
        this.important = important;
    }

    @Override
    public String toString() {
        return "IssueRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", important=" + important +
                '}';
    }
}
