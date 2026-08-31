package tn.star.recouvrementbackend.dto;

import tn.star.recouvrementbackend.entities.Branche;
import tn.star.recouvrementbackend.entities.EtapeMemoire;
import tn.star.recouvrementbackend.entities.StatutMemoire;

import java.time.LocalDate;
import java.util.List;

public record MemoireResponse(
        Long id,
        String numero,
        Long quittanceId,
        String client,
        String adresseClient,
        String telephoneClient,
        String policeNumero,
        Branche branche,
        LocalDate dateEmissionQuittance,
        LocalDate dateEcheanceQuittance,
        LocalDate dateCreation,
        Integer delaiReglement,
        LocalDate dateLimitePaiement,
        String motif,
        String agentTraitant,
        StatutMemoire statut,
        EtapeMemoire etapeActuelle,
        Long montantNet,
        Long frais,
        Long taxe,
        Long totalTTC,
        Long montantRegle,
        Long reste,
        List<EcheancierResponse> echeanciers,
        List<HistoriqueStatutResponse> historique,
        List<PaiementResponse> paiements
) {
}
