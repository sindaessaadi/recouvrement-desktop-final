package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.OrganisationRequest;
import tn.star.recouvrementbackend.dto.OrganisationResponse;
import tn.star.recouvrementbackend.service.OrganisationService;

@RestController
@RequestMapping("/api/organisation")
public class OrganisationController {

    private final OrganisationService organisationService;

    public OrganisationController(OrganisationService organisationService) {
        this.organisationService = organisationService;
    }

    @GetMapping
    public OrganisationResponse get() {
        return organisationService.get();
    }

    @PutMapping
    public OrganisationResponse update(@Valid @RequestBody OrganisationRequest request) {
        return organisationService.update(request);
    }
}
