package com.example.demo.repository;

import com.example.demo.entity.Prospect;
import com.example.demo.entity.ProspectSource;
import com.example.demo.entity.ProspectStatus;
import com.example.demo.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProspectRepository
        extends JpaRepository<Prospect, Long> {

    /*
     * Check duplicate email
     */
    boolean existsByEmail(String email);

    /*
     * Find by email
     */
    Optional<Prospect> findByEmail(String email);

    /*
     * AGENT - all own prospects
     */
    List<Prospect> findByAssignedTo(User user);

    /*
     * AGENT - filter by status
     */
    List<Prospect> findByAssignedToAndStatus(
            User user,
            ProspectStatus status
    );

    /*
     * AGENT - filter by source
     */
    List<Prospect> findByAssignedToAndSource(
            User user,
            ProspectSource source
    );

    /*
     * AGENT - filter by status + source
     */
    List<Prospect> findByAssignedToAndStatusAndSource(
            User user,
            ProspectStatus status,
            ProspectSource source
    );

    /*
     * MANAGER - filter by status
     */
    List<Prospect> findByStatus(
            ProspectStatus status
    );

    /*
     * MANAGER - filter by source
     */
    List<Prospect> findBySource(
            ProspectSource source
    );

    /*
     * MANAGER - filter by status + source
     */
    List<Prospect> findByStatusAndSource(
            ProspectStatus status,
            ProspectSource source
    );
}