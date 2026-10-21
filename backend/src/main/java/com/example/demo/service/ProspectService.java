
package com.example.demo.service;

import com.example.demo.dto.ProspectRequest;
import com.example.demo.dto.ProspectResponse;
import com.example.demo.entity.Prospect;
import com.example.demo.entity.ProspectSource;
import com.example.demo.entity.ProspectStatus;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.ProspectRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProspectService {

    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;

    public ProspectService(
            ProspectRepository prospectRepository,
            UserRepository userRepository
    ) {
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
    }

    // CREATE PROSPECT
    public ProspectResponse createProspect(
            ProspectRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        if (currentUser.getRole() != Role.AGENT) {
            throw new RuntimeException(
                    "Only AGENT can create prospects"
            );
        }

        if (prospectRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "A prospect with this email already exists"
            );
        }

        Prospect prospect = new Prospect();
        prospect.setFirstName(request.getFirstName());
        prospect.setLastName(request.getLastName());
        prospect.setEmail(request.getEmail());
        prospect.setPhone(request.getPhone());
        prospect.setSource(request.getSource());
        prospect.setInterest(request.getInterest());
        prospect.setEstimatedCapital(request.getEstimatedCapital());
        prospect.setNotes(request.getNotes());

        // A new prospect always starts with NEW.
        prospect.setStatus(ProspectStatus.NEW);
        prospect.setAssignedTo(currentUser);

        Prospect savedProspect = prospectRepository.save(prospect);

        return new ProspectResponse(savedProspect);
    }

    // GET ALL PROSPECTS WITH OPTIONAL FILTERS
    @Transactional(readOnly = true)
    public List<ProspectResponse> getProspects(
            ProspectStatus status,
            ProspectSource source,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        List<Prospect> prospects;

        if (currentUser.getRole() == Role.MANAGER) {

            if (status != null && source != null) {
                prospects = prospectRepository
                        .findByStatusAndSource(status, source);

            } else if (status != null) {
                prospects = prospectRepository.findByStatus(status);

            } else if (source != null) {
                prospects = prospectRepository.findBySource(source);

            } else {
                prospects = prospectRepository.findAll();
            }

        } else {

            if (status != null && source != null) {
                prospects = prospectRepository
                        .findByAssignedToAndStatusAndSource(
                                currentUser, status, source
                        );

            } else if (status != null) {
                prospects = prospectRepository
                        .findByAssignedToAndStatus(
                                currentUser, status
                        );

            } else if (source != null) {
                prospects = prospectRepository
                        .findByAssignedToAndSource(
                                currentUser, source
                        );

            } else {
                prospects = prospectRepository
                        .findByAssignedTo(currentUser);
            }
        }

        return prospects.stream()
                .map(ProspectResponse::new)
                .toList();
    }

    // GET PROSPECT BY ID
    @Transactional(readOnly = true)
    public ProspectResponse getProspectById(
            Long prospectId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() ->
                        new RuntimeException("Prospect not found")
                );

        checkAgentAccess(currentUser, prospect);

        return new ProspectResponse(prospect);
    }

    // UPDATE PROSPECT
    public ProspectResponse updateProspect(
            Long prospectId,
            ProspectRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() ->
                        new RuntimeException("Prospect not found")
                );

        checkAgentAccess(currentUser, prospect);

        String newEmail = request.getEmail();

        if (newEmail == null || newEmail.isBlank()) {
            throw new RuntimeException(
                    "Prospect email is required"
            );
        }

        if (!prospect.getEmail().equalsIgnoreCase(newEmail)
                && prospectRepository.existsByEmail(newEmail)) {
            throw new RuntimeException(
                    "A prospect with this email already exists"
            );
        }

        prospect.setFirstName(request.getFirstName());
        prospect.setLastName(request.getLastName());
        prospect.setEmail(newEmail);
        prospect.setPhone(request.getPhone());
        prospect.setSource(request.getSource());
        prospect.setInterest(request.getInterest());
        prospect.setEstimatedCapital(request.getEstimatedCapital());
        prospect.setNotes(request.getNotes());

        // Update status only when the request contains one.
        if (request.getStatus() != null) {
            prospect.setStatus(request.getStatus());
        }

        Prospect updatedProspect = prospectRepository.save(prospect);

        return new ProspectResponse(updatedProspect);
    }

    // ASSIGN / REASSIGN PROSPECT - MANAGER ONLY
    public ProspectResponse assignProspect(
            Long prospectId,
            Long agentId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        if (currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException(
                    "Only MANAGER can assign prospects"
            );
        }

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() ->
                        new RuntimeException("Prospect not found")
                );

        User agent = userRepository.findById(agentId)
                .orElseThrow(() ->
                        new RuntimeException("Agent not found")
                );

        if (agent.getRole() != Role.AGENT) {
            throw new RuntimeException(
                    "The selected user is not an agent"
            );
        }

        prospect.setAssignedTo(agent);

        Prospect updatedProspect = prospectRepository.save(prospect);

        return new ProspectResponse(updatedProspect);
    }

    // GET CURRENT AUTHENTICATED USER
    private User getCurrentUser(
            Authentication authentication
    ) {
        if (authentication == null
                || authentication.getName() == null) {
            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }

    // CHECK AGENT ACCESS
    private void checkAgentAccess(
            User currentUser,
            Prospect prospect
    ) {
        if (currentUser.getRole() == Role.AGENT
                && !prospect.getAssignedTo().getId()
                .equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not allowed to access this prospect"
            );
        }
    }
}
