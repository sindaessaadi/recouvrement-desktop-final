package tn.star.recouvrementbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.SessionResponse;
import tn.star.recouvrementbackend.security.JwtService;
import tn.star.recouvrementbackend.service.SessionService;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final JwtService jwtService;

    public SessionController(SessionService sessionService, JwtService jwtService) {
        this.sessionService = sessionService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<SessionResponse> getMesSessions(Authentication authentication, HttpServletRequest request) {
        return sessionService.getSessionsUtilisateur(authentication.getName(), jtiActuel(request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deconnecter(@PathVariable Long id, Authentication authentication) {
        sessionService.deconnecterSession(id, authentication.getName());
    }

    private String jtiActuel(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        return jwtService.extraireJti(header.substring(7));
    }
}
