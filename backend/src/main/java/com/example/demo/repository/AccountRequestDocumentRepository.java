package com.example.demo.repository;

import com.example.demo.entity.AccountRequestDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRequestDocumentRepository
        extends JpaRepository<AccountRequestDocument, Long> {

    Optional<AccountRequestDocument> findByIdAndAccountRequestId(
            Long documentId,
            Long requestId
    );
}