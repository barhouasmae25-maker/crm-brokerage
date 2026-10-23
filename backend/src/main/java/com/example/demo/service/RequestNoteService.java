package com.example.demo.service;

import com.example.demo.dto.RequestNoteCreateRequest;
import com.example.demo.dto.RequestNoteResponse;
import com.example.demo.entity.AccountRequest;
import com.example.demo.entity.RequestNote;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.AccountRequestRepository;
import com.example.demo.repository.RequestNoteRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RequestNoteService {

    private final RequestNoteRepository requestNoteRepository;
    private final AccountRequestRepository accountRequestRepository;
    private final UserRepository userRepository;

    public RequestNoteService(
            RequestNoteRepository requestNoteRepository,
            AccountRequestRepository accountRequestRepository,
            UserRepository userRepository
    ) {
        this.requestNoteRepository = requestNoteRepository;
        this.accountRequestRepository = accountRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RequestNoteResponse> findByRequestId(
            Long requestId,
            Authentication authentication
    ) {
        requireManager(authentication);

        if (!accountRequestRepository.existsById(requestId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Demande de compte introuvable"
            );
        }

        return requestNoteRepository
                .findByAccountRequest_IdOrderByCreatedAtDesc(requestId)
                .stream()
                .map(RequestNoteResponse::new)
                .toList();
    }

    @Transactional
    public RequestNoteResponse create(
            Long requestId,
            RequestNoteCreateRequest request,
            Authentication authentication
    ) {
        User manager = requireManager(authentication);

        AccountRequest accountRequest = accountRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Demande de compte introuvable"
                ));

        RequestNote note = new RequestNote();
        note.setContent(request.getContent().trim());
        note.setAccountRequest(accountRequest);
        note.setCreatedBy(manager);

        RequestNote savedNote = requestNoteRepository.save(note);

        return new RequestNoteResponse(savedNote);
    }

    private User requireManager(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentification requise"
            );
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Utilisateur introuvable"
                ));

        if (user.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Seul un manager peut gérer les notes internes"
            );
        }

        return user;
    }
}