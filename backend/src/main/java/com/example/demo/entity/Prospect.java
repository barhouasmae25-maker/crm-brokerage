package com.example.demo.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "prospects",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class Prospect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectInterest interest;

    @Column(precision = 15, scale = 2)
    private BigDecimal estimatedCapital;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectStatus status = ProspectStatus.NEW;

    // Date of the last interaction with this prospect
    @Column
    private LocalDateTime lastContactDate;

    // Agent assigned to this prospect
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_to", nullable = false)
    private User assignedTo;

    public Prospect() {
    }

    public Long getId() {
        return id;
    }

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

    public LocalDateTime getLastContactDate() {
        return lastContactDate;
    }

    public void setLastContactDate(LocalDateTime lastContactDate) {
        this.lastContactDate = lastContactDate;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
}