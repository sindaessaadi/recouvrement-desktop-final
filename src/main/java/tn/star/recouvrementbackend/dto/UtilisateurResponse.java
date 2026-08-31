package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.RoleUtilisateur;

public record UtilisateurResponse(
        Long id,
        String nom,
        String email,
        RoleUtilisateur role,
        String telephone,
        boolean actif,
        String initiales
) {
}
