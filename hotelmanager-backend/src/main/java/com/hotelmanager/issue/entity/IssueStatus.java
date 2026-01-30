package com.hotelmanager.issue.entity;

public enum IssueStatus {
    OPEN,       // créé, non résolu
    RESOLVED,   // résolu
    DELETED     // supprimé (soft delete)
}
