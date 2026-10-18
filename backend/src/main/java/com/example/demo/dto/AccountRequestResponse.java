package com.example.demo.dto;

import com.example.demo.entity.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AccountRequestResponse(
        Long id,
        Long prospectId,
        String prospectFirstName,
        String prospectLastName,
        AccountType accountType,
        TradingExperience tradingExperience,
        BigDecimal initialDeposit,
        AccountRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime reviewedAt,
        String reviewComment,
        List<DocumentResponse> documents
) {
    public record DocumentResponse(
            Long id,
            AccountDocumentType documentType,
            String documentUrl,
            boolean verified,
            LocalDateTime verifiedAt
    ) {}
}