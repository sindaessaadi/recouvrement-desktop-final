package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.PreferencesRequest;
import tn.star.recouvrementbackend.dto.PreferencesResponse;
import tn.star.recouvrementbackend.service.PreferencesService;

@RestController
@RequestMapping("/api/preferences")
public class PreferencesController {

    private final PreferencesService preferencesService;

    public PreferencesController(PreferencesService preferencesService) {
        this.preferencesService = preferencesService;
    }

    @GetMapping
    public PreferencesResponse get(Authentication authentication) {
        return preferencesService.getPourUtilisateur(authentication.getName());
    }

    @PutMapping
    public PreferencesResponse update(Authentication authentication, @Valid @RequestBody PreferencesRequest request) {
        return preferencesService.mettreAJour(authentication.getName(), request);
    }
}
