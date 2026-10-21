package com.example.demo.service;

import com.example.demo.dto.AccountRequestCreateRequest;
import com.example.demo.dto.AccountRequestResponse;
import com.example.demo.dto.AccountRequestStatusRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.AccountRequestDocumentRepository;
import com.example.demo.repository.AccountRequestRepository;
import com.example.demo.repository.ProspectRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountRequestService {

    private final AccountRequestRepository requestRepository;
    private final AccountRequestDocumentRepository documentRepository;
    private final ProspectRepository prospectRepository;
    private final ClientService clientService;

    public AccountRequestService(
            AccountRequestRepository requestRepository,
            AccountRequestDocumentRepository documentRepository,
            ProspectRepository prospectRepository,
            ClientService clientService
    ) {
        this.requestRepository = requestRepository;
        this.documentRepository = documentRepository;
        this.prospectRepository = prospectRepository;
        this.clientService = clientService;
    }

    @Transactional
    public AccountRequestResponse create(
            AccountRequestCreateRequest dto,
            Authentication authentication
    ) {
        if (dto.getInitialDeposit() == null
                || dto.getInitialDeposit().compareTo(
                new BigDecimal("1000.00")) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Initial deposit must be at least 1000.00 EUR"
            );
        }

        if (dto.getDocuments() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Documents are required"
            );
        }

        boolean hasIdentity = dto.getDocuments().stream()
                .anyMatch(d -> d.getDocumentType() != null
                        && (d.getDocumentType()
                        == AccountDocumentType.ID_CARD
                        || d.getDocumentType()
                        == AccountDocumentType.PASSPORT));

        boolean hasAddressProof = dto.getDocuments().stream()
                .anyMatch(d -> d.getDocumentType()
                        == AccountDocumentType.PROOF_OF_ADDRESS);

        if (!hasIdentity || !hasAddressProof) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide an ID_CARD or PASSPORT and a PROOF_OF_ADDRESS"
            );
        }

        String email = requireAuthenticatedEmail(authentication);
        boolean manager = isManager(authentication);

        Prospect prospect = prospectRepository
                .findById(dto.getProspectId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Prospect not found"
                ));

        if (!manager && !isAssignedAgent(prospect, email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only create a request for your own prospect"
            );
        }

        if (prospect.getStatus() == ProspectStatus.WON
                || prospect.getStatus() == ProspectStatus.LOST) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot create an account request for a WON or LOST prospect"
            );
        }

        AccountRequest request = new AccountRequest();
        request.setProspect(prospect);
        request.setAccountType(dto.getAccountType());
        request.setTradingExperience(dto.getTradingExperience());
        request.setInitialDeposit(dto.getInitialDeposit());
        request.setStatus(AccountRequestStatus.PENDING_REVIEW);

        for (AccountRequestCreateRequest.DocumentInput input
                : dto.getDocuments()) {

            if (input.getDocumentType() == null
                    || input.getDocumentUrl() == null
                    || input.getDocumentUrl().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Each document must have a type and URL"
                );
            }

            AccountRequestDocument document =
                    new AccountRequestDocument();

            document.setDocumentType(input.getDocumentType());
            document.setDocumentUrl(input.getDocumentUrl().trim());

            request.addDocument(document);
        }

        AccountRequest saved = requestRepository.save(request);
        return toResponse(saved);
    }

    @Transactional
    public List<AccountRequestResponse> findAll(
            Authentication authentication
    ) {
        String email = requireAuthenticatedEmail(authentication);

        List<AccountRequest> requests = isManager(authentication)
                ? requestRepository.findAllByOrderByCreatedAtDesc()
                : requestRepository
                .findByProspectAssignedToEmailOrderByCreatedAtDesc(email);

        return requests.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AccountRequestResponse findById(
            Long requestId,
            Authentication authentication
    ) {
        AccountRequest request = getRequest(requestId);
        checkProspectAccess(request, authentication);

        return toResponse(request);
    }

    @Transactional
    public AccountRequestResponse changeStatus(
            Long requestId,
            AccountRequestStatusRequest dto,
            Authentication authentication
    ) {
        requireManager(authentication);

        AccountRequest request = getRequest(requestId);
        AccountRequestStatus newStatus = dto.getStatus();

        if (newStatus == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status is required"
            );
        }

        if (request.getStatus() == AccountRequestStatus.APPROVED
                || request.getStatus() == AccountRequestStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A final status cannot be changed"
            );
        }

        if (newStatus == AccountRequestStatus.APPROVED) {

            boolean identityVerified = request.getDocuments().stream()
                    .anyMatch(d -> d.isVerified()
                            && (d.getDocumentType()
                            == AccountDocumentType.ID_CARD
                            || d.getDocumentType()
                            == AccountDocumentType.PASSPORT));

            boolean addressVerified = request.getDocuments().stream()
                    .anyMatch(d -> d.isVerified()
                            && d.getDocumentType()
                            == AccountDocumentType.PROOF_OF_ADDRESS);

            if (!identityVerified || !addressVerified) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Verify identity and proof of address before approval"
                );
            }
        }

        request.setStatus(newStatus);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewComment(dto.getReviewComment());

        Prospect prospect = request.getProspect();

        if (newStatus == AccountRequestStatus.APPROVED) {
            prospect.setStatus(ProspectStatus.WON);
        } else if (newStatus == AccountRequestStatus.REJECTED) {
            prospect.setStatus(ProspectStatus.LOST);
        }

        prospectRepository.save(prospect);

        AccountRequest savedRequest = requestRepository.save(request);

        // Automatically create a Client when the request is approved.
        if (newStatus == AccountRequestStatus.APPROVED) {
            clientService.createFromApprovedRequest(
                    savedRequest.getId(),
                    authentication
            );
        }

        return toResponse(savedRequest);
    }

    @Transactional
    public AccountRequestResponse verifyDocument(
            Long requestId,
            Long documentId,
            Authentication authentication
    ) {
        requireManager(authentication);

        AccountRequest request = getRequest(requestId);

        if (request.getStatus() == AccountRequestStatus.APPROVED
                || request.getStatus() == AccountRequestStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Documents cannot be changed after the request is finalized"
            );
        }

        AccountRequestDocument document = documentRepository
                .findByIdAndAccountRequestId(documentId, requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        document.setVerified(true);
        document.setVerifiedAt(LocalDateTime.now());
        documentRepository.save(document);

        return toResponse(request);
    }

    /**
     * Returns a document only to the manager or the agent
     * assigned to the associated prospect.
     */
    @Transactional
    public AccountRequestDocument getDocumentForDownload(
            Long requestId,
            Long documentId,
            Authentication authentication
    ) {
        String email = requireAuthenticatedEmail(authentication);

        AccountRequest request = getRequest(requestId);
        Prospect prospect = request.getProspect();

        boolean manager = isManager(authentication);
        boolean assignedAgent = isAssignedAgent(prospect, email);

        if (!manager && !assignedAgent) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot download this document"
            );
        }

        return documentRepository
                .findByIdAndAccountRequestId(documentId, requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));
    }

    private boolean isAssignedAgent(
            Prospect prospect,
            String email
    ) {
        return prospect.getAssignedTo() != null
                && prospect.getAssignedTo().getEmail() != null
                && email.equalsIgnoreCase(
                prospect.getAssignedTo().getEmail()
        );
    }

    private AccountRequest getRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Account request not found"
                ));
    }

    private void checkProspectAccess(
            AccountRequest request,
            Authentication authentication
    ) {
        String email = requireAuthenticatedEmail(authentication);

        if (!isManager(authentication)
                && !isAssignedAgent(request.getProspect(), email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this account request"
            );
        }
    }

    private void requireManager(Authentication authentication) {
        requireAuthenticatedEmail(authentication);

        if (!isManager(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only MANAGER can perform this operation"
            );
        }
    }

    private boolean isManager(Authentication authentication) {
        if (authentication == null
                || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role ->
                        role.equals("MANAGER")
                                || role.equals("ROLE_MANAGER")
                );
    }

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

    private AccountRequestResponse toResponse(
            AccountRequest request
    ) {
        Prospect prospect = request.getProspect();

        List<AccountRequestResponse.DocumentResponse> documents =
                request.getDocuments().stream()
                        .map(document ->
                                new AccountRequestResponse.DocumentResponse(
                                        document.getId(),
                                        document.getDocumentType(),
                                        document.getDocumentUrl(),
                                        document.isVerified(),
                                        document.getVerifiedAt()
                                )
                        )
                        .toList();

        return new AccountRequestResponse(
                request.getId(),
                prospect.getId(),
                prospect.getFirstName(),
                prospect.getLastName(),
                request.getAccountType(),
                request.getTradingExperience(),
                request.getInitialDeposit(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                request.getReviewedAt(),
                request.getReviewComment(),
                documents
        );
    }
}
