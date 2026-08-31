package tn.star.recouvrementbackend.dto;

public record PreferencesResponse(
        boolean notificationsEmail,
        boolean notificationsApp,
        boolean alerteRelanceEchue,
        boolean alerteImpaye,
        Integer seuilAlerteImpaye,
        String theme,
        String langue,
        String densite,
        String formatDate
) {
}
