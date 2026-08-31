package tn.star.recouvrementbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PreferencesRequest(
        @NotNull Boolean notificationsEmail,
        @NotNull Boolean notificationsApp,
        @NotNull Boolean alerteRelanceEchue,
        @NotNull Boolean alerteImpaye,
        @Min(0) Integer seuilAlerteImpaye,
        String theme,
        String langue,
        String densite,
        String formatDate
) {
}
