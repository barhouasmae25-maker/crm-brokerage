
package com.example.demo.dto;

import com.example.demo.entity.AccountDocumentType;
import com.example.demo.entity.AccountType;
import com.example.demo.entity.TradingExperience;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AccountRequestCreateRequest {

    @NotNull
    private Long prospectId;

    @NotNull
    private AccountType accountType;

    @NotNull
    private TradingExperience tradingExperience;

    @NotNull
    @DecimalMin(value = "1000.00")
    private BigDecimal initialDeposit;

    @NotEmpty
    @Valid
    private List<DocumentInput> documents = new ArrayList<>();

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

    public static class DocumentInput {

        @NotNull
        private AccountDocumentType documentType;

        @NotBlank
        private String fileName;

        public AccountDocumentType getDocumentType() {
            return documentType;
        }

        public void setDocumentType(AccountDocumentType documentType) {
            this.documentType = documentType;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
    }
}
