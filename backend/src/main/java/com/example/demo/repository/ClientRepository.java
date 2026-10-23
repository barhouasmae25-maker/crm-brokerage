
package com.example.demo.repository;

import com.example.demo.entity.Client;
import com.example.demo.entity.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    // Find a client by its associated account request
    Optional<Client> findByAccountRequestId(Long accountRequestId);

    // Get all clients, newest first
    List<Client> findAllByOrderByCreatedAtDesc();

    // Filter clients by status
    List<Client> findByStatusOrderByCreatedAtDesc(
            ClientStatus status
    );

    // Filter clients by assigned agent ID
    List<Client> findByAssignedToIdOrderByCreatedAtDesc(
            Long agentId
    );

    // Filter clients by assigned agent ID and status
    List<Client> findByAssignedToIdAndStatusOrderByCreatedAtDesc(
            Long agentId,
            ClientStatus status
    );

    // Get clients assigned to an agent by email
    List<Client> findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    // Get clients assigned to an agent by email and status
    List<Client> findByAssignedToEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(
            String email,
            ClientStatus status
    );
}
