package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.TypeRelance;

import java.time.LocalDateTime;

public record RelanceResponse(
        Long id,
        LocalDateTime dateHeure,
        Long memoireId,
        String memoireNumero,
        String client,
        TypeRelance type,
        String canal,
        String utilisateur,
        String resultat,
        String message
) {
}
