package com.example.demo.service;

import com.example.demo.dto.InteractionRequest;
import com.example.demo.dto.InteractionResponse;
import com.example.demo.entity.Interaction;
import com.example.demo.entity.Prospect;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.InteractionRepository;
import com.example.demo.repository.ProspectRepository;
import com.example.demo.repository.UserRepository;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;

    public InteractionService(
            InteractionRepository interactionRepository,
            ProspectRepository prospectRepository,
            UserRepository userRepository
    ) {
        this.interactionRepository = interactionRepository;
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
    }

    public InteractionResponse createProspectInteraction(
            Long prospectId,
            InteractionRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() ->
                        new RuntimeException("Prospect not found"));

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

    public List<InteractionResponse> getProspectInteractions(
            Long prospectId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() ->
                        new RuntimeException("Prospect not found"));

        checkProspectAccess(prospect, currentUser);

        return interactionRepository
                .findByProspectOrderByCreatedAtDesc(prospect)
                .stream()
                .map(InteractionResponse::from)
                .toList();
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    private void checkProspectAccess(
            Prospect prospect,
            User currentUser
    ) {
        if (currentUser.getRole() == Role.AGENT) {
            if (prospect.getAssignedTo() == null
                    || !prospect.getAssignedTo().getId()
                    .equals(currentUser.getId())) {
                throw new RuntimeException(
                        "You are not allowed to access this prospect"
                );
            }
        }
    }
}