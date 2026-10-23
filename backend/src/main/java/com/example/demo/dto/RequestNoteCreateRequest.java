package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RequestNoteCreateRequest {

    @NotBlank(message = "Le contenu de la note est obligatoire")
    @Size(max = 5000, message = "La note ne doit pas dépasser 5000 caractères")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}