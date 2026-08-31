package tn.star.recouvrementbackend.dto;

import java.time.LocalDateTime;

public record LogActiviteResponse(
        Long id,
        LocalDateTime date,
        String utilisateur,
        String action
) {
}
