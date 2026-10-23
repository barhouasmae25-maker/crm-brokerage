package com.example.demo.dto;

import com.example.demo.entity.RequestNote;
import java.time.LocalDateTime;

public class RequestNoteResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long accountRequestId;
    private Long createdById;
    private String createdByEmail;

    public RequestNoteResponse(RequestNote note) {
        this.id = note.getId();
        this.content = note.getContent();
        this.createdAt = note.getCreatedAt();
        this.accountRequestId = note.getAccountRequest().getId();
        this.createdById = note.getCreatedBy().getId();
        this.createdByEmail = note.getCreatedBy().getEmail();
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getAccountRequestId() {
        return accountRequestId;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }
}