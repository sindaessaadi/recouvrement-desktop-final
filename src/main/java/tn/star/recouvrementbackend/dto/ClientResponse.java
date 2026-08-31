package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.StatutClient;

import java.time.LocalDate;
import java.util.List;

public record ClientResponse(
        Long id,
        String nom,
        String raisonSociale,
        String matricule,
        String cin,
        String telephone,
        String email,
        String adresse,
        StatutClient statut,
        String charge,
        Integer anneeAppartenance,
        Long montantImpaye,
        String branche,
        List<String> polices,
        Integer nbMemoires,
        Integer tauxRecouvrement,
        LocalDate dernierPaiement,
        Integer alertes,
        List<ContactResponsableResponse> contactsResponsables
) {
}
