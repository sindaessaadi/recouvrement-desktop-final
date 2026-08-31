package tn.star.recouvrementbackend.dto;

import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        String appareil,
        String adresseIp,
        LocalDateTime dateConnexion,
        LocalDateTime derniereActivite,
        boolean actif,
        boolean sessionActuelle
) {
}
