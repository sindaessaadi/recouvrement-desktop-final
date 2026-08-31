package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tn.star.recouvrementbackend.entities.RoleUtilisateur;

public record UtilisateurRequest(
        @NotBlank String nom,
        @NotBlank @Email String email,
        // Optionnel a la modification (mot de passe inchange si non fourni) ; obligatoire a la creation
        // (verifie dans le service, pas ici, pour pouvoir distinguer creation/modification).
        String motDePasse,
        @NotNull RoleUtilisateur role,
        String telephone,
        Boolean actif
) {
}
