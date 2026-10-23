
package com.example.demo.controller;

import com.example.demo.dto.AgentResponse;
import com.example.demo.entity.Role;
import com.example.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users with the AGENT role (MANAGER only)
    @GetMapping("/agents")
    public ResponseEntity<List<AgentResponse>> getAgents(
            Authentication authentication) {

        boolean isManager =
                authentication != null
                        && authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("MANAGER")
                                        || authority.getAuthority().equals("ROLE_MANAGER")
                        );

        if (!isManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Seul un MANAGER peut consulter les agents"
            );
        }

        List<AgentResponse> agents =
                userRepository.findByRole(Role.AGENT)
                        .stream()
                        .map(user -> new AgentResponse(
                                user.getId(),
                                user.getEmail()
                        ))
                        .toList();

        return ResponseEntity.ok(agents);
    }
}
