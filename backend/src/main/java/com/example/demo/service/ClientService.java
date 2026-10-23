
package com.example.demo.service;

import com.example.demo.dto.ClientResponse;
import com.example.demo.dto.ClientUpdateRequest;
import com.example.demo.entity.AccountRequest;
import com.example.demo.entity.AccountRequestStatus;
import com.example.demo.entity.Client;
import com.example.demo.entity.ClientStatus;
import com.example.demo.entity.Prospect;
import com.example.demo.entity.User;
import com.example.demo.repository.AccountRequestRepository;
import com.example.demo.repository.ClientRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final AccountRequestRepository requestRepository;

    public ClientService(
            ClientRepository clientRepository,
            AccountRequestRepository requestRepository
    ) {
        this.clientRepository = clientRepository;
        this.requestRepository = requestRepository;
    }

    /**
     * Create a client from an approved account request.
     * Only a MANAGER can perform this operation.
     */
    @Transactional
    public ClientResponse createFromApprovedRequest(
            Long requestId,
            Authentication authentication
    ) {
        requireManager(authentication);

        AccountRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Account request not found"
                ));

        if (request.getStatus() != AccountRequestStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only approved account requests can create clients"
            );
        }

        // Avoid creating the same client more than once.
        Client existing = clientRepository
                .findByAccountRequestId(requestId)
                .orElse(null);

        if (existing != null) {
            return toResponse(existing);
        }

        Prospect prospect = request.getProspect();

        if (prospect == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The account request has no associated prospect"
            );
        }

        User assignedAgent = prospect.getAssignedTo();

        if (assignedAgent == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The prospect must be assigned to an agent before creating a client"
            );
        }

        Client client = new Client();
        client.setAccountRequest(request);
        client.setProspect(prospect);
        client.setAssignedTo(assignedAgent);
        client.setBalance(request.getInitialDeposit());
        client.setStatus(ClientStatus.ACTIVE);

        /*
         * Save and flush to obtain the generated database ID.
         * Client.onCreate() may generate the account number.
         */
        Client saved = clientRepository.saveAndFlush(client);

        /*
         * Fallback in case the entity lifecycle callback did not
         * generate an account number.
         */
        if (saved.getAccountNumber() == null
                || saved.getAccountNumber().isBlank()) {

            saved.setAccountNumber(String.format(
                    "ACC-%04d-%06d",
                    LocalDateTime.now().getYear(),
                    saved.getId()
            ));

            saved = clientRepository.saveAndFlush(saved);
        }

        return toResponse(saved);
    }

    /**
     * Get clients.
     * MANAGER can see all clients and optionally filter by agent/status.
     * AGENT can only see clients assigned to their own account.
     */
    @Transactional
    public List<ClientResponse> findAll(
            ClientStatus status,
            Long assignedTo,
            Authentication authentication
    ) {
        String email = requireAuthenticatedEmail(authentication);
        boolean manager = isManager(authentication);

        List<Client> clients;

        if (manager) {
            if (assignedTo != null && status != null) {
                clients = clientRepository
                        .findByAssignedToIdAndStatusOrderByCreatedAtDesc(
                                assignedTo,
                                status
                        );
            } else if (assignedTo != null) {
                clients = clientRepository
                        .findByAssignedToIdOrderByCreatedAtDesc(
                                assignedTo
                        );
            } else if (status != null) {
                clients = clientRepository
                        .findByStatusOrderByCreatedAtDesc(status);
            } else {
                clients = clientRepository
                        .findAllByOrderByCreatedAtDesc();
            }
        } else {
            // Agents must never access another agent's clients.
            if (status != null) {
                clients = clientRepository
                        .findByAssignedToEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(
                                email,
                                status
                        );
            } else {
                clients = clientRepository
                        .findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(
                                email
                        );
            }
        }

        return clients.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get one client by ID.
     */
    @Transactional
    public ClientResponse findById(
            Long clientId,
            Authentication authentication
    ) {
        Client client = getClient(clientId);

        checkAccess(client, authentication);

        return toResponse(client);
    }

    /**
     * Update the status of a client.
     */
    @Transactional
    public ClientResponse update(
            Long clientId,
            ClientUpdateRequest dto,
            Authentication authentication
    ) {
        if (dto == null || dto.status() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Client status is required"
            );
        }

        Client client = getClient(clientId);

        checkAccess(client, authentication);

        client.setStatus(dto.status());

        Client saved = clientRepository.save(client);

        return toResponse(saved);
    }

    /**
     * Find a client or return HTTP 404.
     */
    private Client getClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found"
                ));
    }

    /**
     * Check whether the authenticated user may access this client.
     */
    private void checkAccess(
            Client client,
            Authentication authentication
    ) {
        String email = requireAuthenticatedEmail(authentication);

        if (isManager(authentication)) {
            return;
        }

        User assignedAgent = client.getAssignedTo();

        if (assignedAgent == null
                || assignedAgent.getEmail() == null
                || !assignedAgent.getEmail().equalsIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this client"
            );
        }
    }

    /**
     * Convert a Client entity into its API response DTO.
     */
    private ClientResponse toResponse(Client client) {
        Prospect prospect = client.getProspect();
        User agent = client.getAssignedTo();

        return new ClientResponse(
                client.getId(),
                client.getAccountNumber(),
                client.getAccountRequest().getId(),
                prospect.getId(),
                prospect.getFirstName(),
                prospect.getLastName(),
                prospect.getEmail(),
                prospect.getPhone(),
                client.getBalance(),
                client.getStatus(),
                agent.getId(),
                agent.getEmail(),
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }

    /**
     * Ensure the current user is a MANAGER.
     */
    private void requireManager(Authentication authentication) {
        requireAuthenticatedEmail(authentication);

        if (!isManager(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only MANAGER can create clients"
            );
        }
    }

    /**
     * Determine whether the user has MANAGER authority.
     */
    private boolean isManager(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities() != null
                && authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role ->
                        role.equals("MANAGER")
                                || role.equals("ROLE_MANAGER")
                );
    }

    /**
     * Return the authenticated user's email or HTTP 401.
     */
    private String requireAuthenticatedEmail(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return authentication.getName();
    }
}
