package com.example.demo.dto;

import com.example.demo.entity.Prospect;
import com.example.demo.entity.ProspectInterest;
import com.example.demo.entity.ProspectSource;
import com.example.demo.entity.ProspectStatus;

import java.math.BigDecimal;

public class ProspectResponse {

    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private ProspectSource source;
    private ProspectInterest interest;

    private BigDecimal estimatedCapital;
    private String notes;

    private ProspectStatus status;

    private Long assignedTo;
    private String assignedToEmail;

    public ProspectResponse() {
    }

    public ProspectResponse(Prospect prospect) {

        this.id = prospect.getId();

        this.firstName = prospect.getFirstName();
        this.lastName = prospect.getLastName();
        this.email = prospect.getEmail();
        this.phone = prospect.getPhone();

        this.source = prospect.getSource();
        this.interest = prospect.getInterest();

        this.estimatedCapital =
                prospect.getEstimatedCapital();

        this.notes = prospect.getNotes();

        this.status = prospect.getStatus();

        if (prospect.getAssignedTo() != null) {

            this.assignedTo =
                    prospect.getAssignedTo().getId();

            this.assignedToEmail =
                    prospect.getAssignedTo().getEmail();
        }
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public ProspectSource getSource() {
        return source;
    }

    public ProspectInterest getInterest() {
        return interest;
    }

    public BigDecimal getEstimatedCapital() {
        return estimatedCapital;
    }

    public String getNotes() {
        return notes;
    }

    public ProspectStatus getStatus() {
        return status;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }
}