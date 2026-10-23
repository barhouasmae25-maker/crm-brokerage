
package com.example.demo.dto;

public class AgentResponse {

    private Long id;
    private String email;

    public AgentResponse(Long id, String email) {
        this.id = id;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}
