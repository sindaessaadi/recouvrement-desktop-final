package tn.star.recouvrementbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import tn.star.recouvrementbackend.entities.StatutClient;

import java.util.List;

public record ClientRequest(
        @NotBlank String nom,
        String raisonSociale,
        String matricule,
        String cin,
        String telephone,
        @Email String email,
        String adresse,
        StatutClient statut,
        String charge,
        Integer anneeAppartenance,
        @Valid List<ContactResponsableRequest> contactsResponsables
) {
}
