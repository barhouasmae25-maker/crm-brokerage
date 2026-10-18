package com.example.demo.dto;

import com.example.demo.entity.ProspectInterest;
import com.example.demo.entity.ProspectSource;
import com.example.demo.entity.ProspectStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ProspectRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Source is required")
    private ProspectSource source;

    @NotNull(message = "Interest is required")
    private ProspectInterest interest;

    private BigDecimal estimatedCapital;

    private String notes;

    /*
     * Status is optional when creating.
     * If not provided, service will use NEW.
     */
    private ProspectStatus status;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public ProspectSource getSource() {
        return source;
    }

    public void setSource(ProspectSource source) {
        this.source = source;
    }

    public ProspectInterest getInterest() {
        return interest;
    }

    public void setInterest(ProspectInterest interest) {
        this.interest = interest;
    }

    public BigDecimal getEstimatedCapital() {
        return estimatedCapital;
    }

    public void setEstimatedCapital(BigDecimal estimatedCapital) {
        this.estimatedCapital = estimatedCapital;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public ProspectStatus getStatus() {
        return status;
    }

    public void setStatus(ProspectStatus status) {
        this.status = status;
    }
}