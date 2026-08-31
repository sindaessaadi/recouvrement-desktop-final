package tn.star.recouvrementbackend.dto;

public record LoginResponse(String token, UtilisateurResponse utilisateur) {
}
