package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.ClientRequest;
import tn.star.recouvrementbackend.dto.ClientResponse;
import tn.star.recouvrementbackend.dto.MemoireHistoriqueResponse;
import tn.star.recouvrementbackend.service.ClientService;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<ClientResponse> getAll() {
        return clientService.getAll();
    }

    @GetMapping("/{id}")
    public ClientResponse getById(@PathVariable Long id) {
        return clientService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(@Valid @RequestBody ClientRequest request) {
        return clientService.create(request);
    }

    @PutMapping("/{id}")
    public ClientResponse update(@PathVariable Long id, @Valid @RequestBody ClientRequest request) {
        return clientService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clientService.delete(id);
    }

    @GetMapping("/{id}/memoires")
    public List<MemoireHistoriqueResponse> getMemoiresHistorique(@PathVariable Long id) {
        return clientService.getMemoiresHistorique(id);
    }
}
