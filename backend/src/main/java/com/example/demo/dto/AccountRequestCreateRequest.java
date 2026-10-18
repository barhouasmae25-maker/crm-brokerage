
package com.example.demo.dto;

import com.example.demo.entity.AccountDocumentType;
import com.example.demo.entity.AccountType;
import com.example.demo.entity.TradingExperience;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class AccountRequestCreateRequest {

    @NotNull
    private Long prospectId;

    @NotNull
    private AccountType accountType;

    @NotNull
    private TradingExperience tradingExperience;

    @NotNull
    @DecimalMin(
            value = "1000.00",
            message = "Initial deposit must be at least 1000.00 EUR"
    )
    @Digits(integer = 13, fraction = 2)
    private BigDecimal initialDeposit;

    @NotNull
    @Size(min = 2, message = "At least two documents are required")
    @Valid
    private List<DocumentInput> documents;

    public static class DocumentInput {

        @NotNull
        private AccountDocumentType documentType;

        private String documentUrl;

        public AccountDocumentType getDocumentType() {
            return documentType;
        }

        public void setDocumentType(AccountDocumentType documentType) {
            this.documentType = documentType;
        }

        public String getDocumentUrl() {
            return documentUrl;
        }

        public void setDocumentUrl(String documentUrl) {
            this.documentUrl = documentUrl;
        }
    }

    public Long getProspectId() {
        return prospectId;
    }

    public void setProspectId(Long prospectId) {
        this.prospectId = prospectId;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public TradingExperience getTradingExperience() {
        return tradingExperience;
    }

    public void setTradingExperience(TradingExperience tradingExperience) {
        this.tradingExperience = tradingExperience;
    }

    public BigDecimal getInitialDeposit() {
        return initialDeposit;
    }

    public void setInitialDeposit(BigDecimal initialDeposit) {
        this.initialDeposit = initialDeposit;
    }

    public List<DocumentInput> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentInput> documents) {
        this.documents = documents;
    }
}
