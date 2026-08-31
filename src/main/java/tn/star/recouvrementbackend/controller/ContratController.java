package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.ContratRequest;
import tn.star.recouvrementbackend.dto.ContratResponse;
import tn.star.recouvrementbackend.service.ContratService;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
public class ContratController {

    private final ContratService contratService;

    public ContratController(ContratService contratService) {
        this.contratService = contratService;
    }

    @GetMapping
    public List<ContratResponse> getAll(@RequestParam(required = false) Long clientId) {
        return clientId != null ? contratService.getByClient(clientId) : contratService.getAll();
    }

    @GetMapping("/{id}")
    public ContratResponse getById(@PathVariable Long id) {
        return contratService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContratResponse create(@Valid @RequestBody ContratRequest request) {
        return contratService.create(request);
    }

    @PutMapping("/{id}")
    public ContratResponse update(@PathVariable Long id, @Valid @RequestBody ContratRequest request) {
        return contratService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        contratService.delete(id);
    }
}
