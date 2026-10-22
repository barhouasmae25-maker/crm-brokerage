
package com.example.demo.dto;

import com.example.demo.entity.AccountDocumentType;
import com.example.demo.entity.AccountRequestStatus;
import com.example.demo.entity.AccountType;
import com.example.demo.entity.TradingExperience;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AccountRequestResponse {

    private Long id;
    private Long prospectId;
    private String prospectFirstName;
    private String prospectLastName;
    private AccountType accountType;
    private TradingExperience tradingExperience;
    private BigDecimal initialDeposit;
    private AccountRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;
    private String reviewComment;
    private List<DocumentResponse> documents;

    public AccountRequestResponse(
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
        this.id = id;
        this.prospectId = prospectId;
        this.prospectFirstName = prospectFirstName;
        this.prospectLastName = prospectLastName;
        this.accountType = accountType;
        this.tradingExperience = tradingExperience;
        this.initialDeposit = initialDeposit;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.reviewedAt = reviewedAt;
        this.reviewComment = reviewComment;
        this.documents = documents;
    }

    public Long getId() {
        return id;
    }

    public Long getProspectId() {
        return prospectId;
    }

    public String getProspectFirstName() {
        return prospectFirstName;
    }

    public String getProspectLastName() {
        return prospectLastName;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public TradingExperience getTradingExperience() {
        return tradingExperience;
    }

    public BigDecimal getInitialDeposit() {
        return initialDeposit;
    }

    public AccountRequestStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public String getReviewComment() {
        return reviewComment;
    }

    public List<DocumentResponse> getDocuments() {
        return documents;
    }

    public static class DocumentResponse {

        private Long id;
        private AccountDocumentType documentType;
        private String fileName;
        private boolean verified;
        private LocalDateTime verifiedAt;

        public DocumentResponse(
                Long id,
                AccountDocumentType documentType,
                String fileName,
                boolean verified,
                LocalDateTime verifiedAt
        ) {
            this.id = id;
            this.documentType = documentType;
            this.fileName = fileName;
            this.verified = verified;
            this.verifiedAt = verifiedAt;
        }

        public Long getId() {
            return id;
        }

        public AccountDocumentType getDocumentType() {
            return documentType;
        }

        public String getFileName() {
            return fileName;
        }

        public boolean isVerified() {
            return verified;
        }

        public LocalDateTime getVerifiedAt() {
            return verifiedAt;
        }
    }
}
