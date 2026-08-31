package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.StatutMemoire;

import java.time.LocalDate;

public record MemoireRecentResponse(String id, String client, LocalDate date, Long montant, StatutMemoire statut) {
}
