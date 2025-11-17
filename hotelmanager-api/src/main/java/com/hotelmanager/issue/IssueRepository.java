package com.hotelmanager.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    // Tous les signalements d’un hôtel
    List<Issue> findByHotelId(Long hotelId);

    // Tous les signalements d’un hôtel avec status différent de DELETED
    List<Issue> findByHotelIdAndStatusNot(Long hotelId, IssueStatus status);

    // Tous les signalements créés par un user
    List<Issue> findByCreatedById(Long userId);
}
