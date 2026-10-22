package com.example.demo.repository;

import com.example.demo.entity.RequestNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestNoteRepository
        extends JpaRepository<RequestNote, Long> {

    List<RequestNote> findByAccountRequest_IdOrderByCreatedAtDesc(
            Long accountRequestId
    );
}