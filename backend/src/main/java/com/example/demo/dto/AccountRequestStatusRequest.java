package com.example.demo.dto;

import com.example.demo.entity.AccountRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AccountRequestStatusRequest {

    @NotNull
    private AccountRequestStatus status;

    @Size(max = 2000)
    private String reviewComment;

    public AccountRequestStatus getStatus() {
        return status;
    }

    public void setStatus(AccountRequestStatus status) {
        this.status = status;
    }

    public String getReviewComment() {
        return reviewComment;
    }

    public void setReviewComment(String reviewComment) {
        this.reviewComment = reviewComment;
    }
}