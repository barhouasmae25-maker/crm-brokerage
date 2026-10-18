
package com.example.demo.controller;

import com.example.demo.dto.AccountRequestCreateRequest;
import com.example.demo.dto.AccountRequestResponse;
import com.example.demo.dto.AccountRequestStatusRequest;
import com.example.demo.entity.AccountDocumentType;
import com.example.demo.entity.AccountRequestDocument;
import com.example.demo.service.AccountRequestService;
import com.example.demo.service.DocumentStorageService;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/account-requests")
public class AccountRequestController {

    private final AccountRequestService accountRequestService;
    private final DocumentStorageService documentStorageService;

    public AccountRequestController(
            AccountRequestService accountRequestService,
            DocumentStorageService documentStorageService
    ) {
        this.accountRequestService = accountRequestService;
        this.documentStorageService = documentStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AccountRequestResponse create(
            @Valid @RequestPart("request")
            AccountRequestCreateRequest request,

            @RequestPart("identityDocument")
            MultipartFile identityDocument,

            @RequestPart("addressDocument")
            MultipartFile addressDocument,

            Authentication authentication
    ) {
        if (identityDocument.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Identity document is required"
            );
        }

        if (addressDocument.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Proof of address is required"
            );
        }

        if (request.getDocuments() == null ||
                request.getDocuments().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Documents are required"
            );
        }

        var identityInput = request.getDocuments().stream()
                .filter(document ->
                        document.getDocumentType() == AccountDocumentType.ID_CARD ||
                                document.getDocumentType() == AccountDocumentType.PASSPORT)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Provide an ID_CARD or PASSPORT"
                ));

        var addressInput = request.getDocuments().stream()
                .filter(document ->
                        document.getDocumentType() ==
                                AccountDocumentType.PROOF_OF_ADDRESS)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Provide proof of address"
                ));

        String identityStoredName =
                documentStorageService.store(identityDocument);

        String addressStoredName =
                documentStorageService.store(addressDocument);

        identityInput.setDocumentUrl(identityStoredName);
        addressInput.setDocumentUrl(addressStoredName);

        return accountRequestService.create(request, authentication);
    }

    @GetMapping
    public List<AccountRequestResponse> findAll(
            Authentication authentication
    ) {
        return accountRequestService.findAll(authentication);
    }

    @GetMapping("/{requestId}")
    public AccountRequestResponse findById(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        return accountRequestService.findById(requestId, authentication);
    }

    @PutMapping("/{requestId}/status")
    public AccountRequestResponse changeStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody AccountRequestStatusRequest request,
            Authentication authentication
    ) {
        return accountRequestService.changeStatus(
                requestId, request, authentication);
    }

    @PutMapping("/{requestId}/documents/{docId}/verify")
    public AccountRequestResponse verifyDocument(
            @PathVariable Long requestId,
            @PathVariable Long docId,
            Authentication authentication
    ) {
        return accountRequestService.verifyDocument(
                requestId, docId, authentication);
    }

    @GetMapping("/{requestId}/documents/{docId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long requestId,
            @PathVariable Long docId,
            Authentication authentication
    ) throws IOException {

        AccountRequestDocument document =
                accountRequestService.getDocumentForDownload(
                        requestId, docId, authentication);

        Path path = documentStorageService.getPath(
                document.getDocumentUrl());

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Document file not found");
        }

        String contentType = Files.probeContentType(path);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (contentType != null) {
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (org.springframework.http.InvalidMediaTypeException ignored) {
                // Keep application/octet-stream.
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                path.getFileName().toString() + "\""
                )
                .body(resource);
    }
}
