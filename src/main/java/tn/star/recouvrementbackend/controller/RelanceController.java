package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.RelanceRequest;
import tn.star.recouvrementbackend.dto.RelanceResponse;
import tn.star.recouvrementbackend.service.RelanceService;

import java.util.List;

@RestController
@RequestMapping("/api/relances")
public class RelanceController {

    private final RelanceService relanceService;

    public RelanceController(RelanceService relanceService) {
        this.relanceService = relanceService;
    }

    @GetMapping
    public List<RelanceResponse> getAll() {
        return relanceService.getAll();
    }

    @GetMapping("/{id}")
    public RelanceResponse getById(@PathVariable Long id) {
        return relanceService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RelanceResponse create(@Valid @RequestBody RelanceRequest request) {
        return relanceService.create(request);
    }
}
