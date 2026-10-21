
package com.example.demo.service;

import com.example.demo.dto.InteractionRequest;
import com.example.demo.dto.InteractionResponse;
import com.example.demo.entity.Client;
import com.example.demo.entity.Interaction;
import com.example.demo.entity.Prospect;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.InteractionRepository;
import com.example.demo.repository.ProspectRepository;
import com.example.demo.repository.UserRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ProspectRepository prospectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public InteractionService(
            InteractionRepository interactionRepository,
            ProspectRepository prospectRepository,
            ClientRepository clientRepository,
            UserRepository userRepository
    ) {
        this.interactionRepository = interactionRepository;
        this.prospectRepository = prospectRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    // CREATE INTERACTION FOR A PROSPECT
    public InteractionResponse createProspectInteraction(
            Long prospectId,
            InteractionRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Prospect prospect = getProspect(prospectId);

        checkProspectAccess(prospect, currentUser);

        Interaction interaction = new Interaction();
        interaction.setType(request.type());
        interaction.setNotes(request.notes());
        interaction.setOutcome(request.outcome());
        interaction.setNextAction(request.nextAction());
        interaction.setNextActionDate(request.nextActionDate());
        interaction.setProspect(prospect);
        interaction.setCreatedBy(currentUser);

        prospect.setLastContactDate(LocalDateTime.now());

        Interaction saved = interactionRepository.save(interaction);

        return InteractionResponse.from(saved);
    }

    // GET INTERACTIONS FOR A PROSPECT
    public List<InteractionResponse> getProspectInteractions(
            Long prospectId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Prospect prospect = getProspect(prospectId);

        checkProspectAccess(prospect, currentUser);

        return interactionRepository
                .findByProspectOrderByCreatedAtDesc(prospect)
                .stream()
                .map(InteractionResponse::from)
                .toList();
    }

    // CREATE INTERACTION FOR A CLIENT
    public InteractionResponse createClientInteraction(
            Long clientId,
            InteractionRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Client client = getClient(clientId);

        checkClientAccess(client, currentUser);

        Interaction interaction = new Interaction();
        interaction.setType(request.type());
        interaction.setNotes(request.notes());
        interaction.setOutcome(request.outcome());
        interaction.setNextAction(request.nextAction());
        interaction.setNextActionDate(request.nextActionDate());
        interaction.setClient(client);
        interaction.setCreatedBy(currentUser);

        // Update the contact date of the prospect linked to this client.
        if (client.getProspect() != null) {
            client.getProspect().setLastContactDate(
                    LocalDateTime.now()
            );
        }

        Interaction saved = interactionRepository.save(interaction);

        return InteractionResponse.from(saved);
    }

    // GET INTERACTIONS FOR A CLIENT
    public List<InteractionResponse> getClientInteractions(
            Long clientId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Client client = getClient(clientId);

        checkClientAccess(client, currentUser);

        return interactionRepository
                .findByClientOrderByCreatedAtDesc(client)
                .stream()
                .map(InteractionResponse::from)
                .toList();
    }

    private User getCurrentUser(Authentication authentication) {
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

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));
    }

    private Prospect getProspect(Long prospectId) {
        return prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Prospect not found"
                ));
    }

    private Client getClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found"
                ));
    }

    private void checkProspectAccess(
            Prospect prospect,
            User currentUser
    ) {
        if (currentUser.getRole() == Role.AGENT) {
            if (prospect.getAssignedTo() == null
                    || !prospect.getAssignedTo().getId()
                    .equals(currentUser.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to access this prospect"
                );
            }
        }
    }

    private void checkClientAccess(
            Client client,
            User currentUser
    ) {
        if (currentUser.getRole() == Role.AGENT) {
            if (client.getAssignedTo() == null
                    || !client.getAssignedTo().getId()
                    .equals(currentUser.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to access this client"
                );
            }
        }
    }
}
