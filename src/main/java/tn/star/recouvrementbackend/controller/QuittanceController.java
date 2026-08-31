package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.QuittanceRequest;
import tn.star.recouvrementbackend.dto.QuittanceResponse;
import tn.star.recouvrementbackend.service.QuittanceService;

import java.util.List;

@RestController
@RequestMapping("/api/quittances")
public class QuittanceController {

    private final QuittanceService quittanceService;

    public QuittanceController(QuittanceService quittanceService) {
        this.quittanceService = quittanceService;
    }

    @GetMapping
    public List<QuittanceResponse> getAll(@RequestParam(required = false) Long clientId) {
        return clientId != null ? quittanceService.getByClient(clientId) : quittanceService.getAll();
    }

    @GetMapping("/{id}")
    public QuittanceResponse getById(@PathVariable Long id) {
        return quittanceService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuittanceResponse create(@Valid @RequestBody QuittanceRequest request) {
        return quittanceService.create(request);
    }

    @PutMapping("/{id}")
    public QuittanceResponse update(@PathVariable Long id, @Valid @RequestBody QuittanceRequest request) {
        return quittanceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        quittanceService.delete(id);
    }
}
