package tn.star.recouvrementbackend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.ChangerMotDePasseRequest;
import tn.star.recouvrementbackend.dto.LoginRequest;
import tn.star.recouvrementbackend.dto.LoginResponse;
import tn.star.recouvrementbackend.dto.UtilisateurResponse;
import tn.star.recouvrementbackend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return authService.login(request, httpRequest);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest httpRequest) {
        authService.logout(httpRequest);
    }

    @GetMapping("/me")
    public UtilisateurResponse me(Authentication authentication) {
        return authService.getUtilisateurConnecte(authentication.getName());
    }

    @PutMapping("/mot-de-passe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changerMotDePasse(Authentication authentication, @Valid @RequestBody ChangerMotDePasseRequest request) {
        authService.changerMotDePasse(authentication.getName(), request);
    }
}
