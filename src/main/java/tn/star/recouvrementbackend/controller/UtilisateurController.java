package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.UtilisateurRequest;
import tn.star.recouvrementbackend.dto.UtilisateurResponse;
import tn.star.recouvrementbackend.service.UtilisateurService;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public List<UtilisateurResponse> getAll() {
        return utilisateurService.getAll();
    }

    @GetMapping("/{id}")
    public UtilisateurResponse getById(@PathVariable Long id) {
        return utilisateurService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurResponse create(@Valid @RequestBody UtilisateurRequest request) {
        return utilisateurService.create(request);
    }

    @PutMapping("/{id}")
    public UtilisateurResponse update(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest request) {
        return utilisateurService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        utilisateurService.delete(id);
    }
}
