package tn.star.recouvrementbackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.PaiementResponse;
import tn.star.recouvrementbackend.service.PaiementService;

import java.util.List;

@RestController
@RequestMapping("/api/paiements")
public class PaiementController {

    private final PaiementService paiementService;

    public PaiementController(PaiementService paiementService) {
        this.paiementService = paiementService;
    }

    @GetMapping
    public List<PaiementResponse> getAll() {
        return paiementService.getAll();
    }

    @GetMapping("/{id}")
    public PaiementResponse getById(@PathVariable Long id) {
        return paiementService.getById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        paiementService.delete(id);
    }
}
