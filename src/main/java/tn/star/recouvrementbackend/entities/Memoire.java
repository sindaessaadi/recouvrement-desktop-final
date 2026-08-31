package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "memoires")
public class Memoire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private LocalDate dateCreation;
    private Integer delaiReglement; // 15, 30, 45 ou 60 jours (choix contraint)
    private String motif;
    private String agentTraitant;

    @Enumerated(EnumType.STRING)
    private StatutMemoire statut;

    @Enumerated(EnumType.STRING)
    private EtapeMemoire etapeActuelle;

    @OneToOne
    @JoinColumn(name = "quittance_id")
    private Quittance quittance;

    @OneToMany(mappedBy = "memoire", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Echeancier> echeanciers;

    @OneToMany(mappedBy = "memoire", cascade = CascadeType.ALL)
    private List<HistoriqueStatut> historique;

    @OneToMany(mappedBy = "memoire", cascade = CascadeType.ALL)
    private List<Paiement> paiements;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
    public Integer getDelaiReglement() { return delaiReglement; }
    public void setDelaiReglement(Integer delaiReglement) { this.delaiReglement = delaiReglement; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
    public String getAgentTraitant() { return agentTraitant; }
    public void setAgentTraitant(String agentTraitant) { this.agentTraitant = agentTraitant; }
    public StatutMemoire getStatut() { return statut; }
    public void setStatut(StatutMemoire statut) { this.statut = statut; }
    public EtapeMemoire getEtapeActuelle() { return etapeActuelle; }
    public void setEtapeActuelle(EtapeMemoire etapeActuelle) { this.etapeActuelle = etapeActuelle; }
    public Quittance getQuittance() { return quittance; }
    public void setQuittance(Quittance quittance) { this.quittance = quittance; }
    public List<Echeancier> getEcheanciers() { return echeanciers; }
    public void setEcheanciers(List<Echeancier> echeanciers) { this.echeanciers = echeanciers; }
    public List<HistoriqueStatut> getHistorique() { return historique; }
    public void setHistorique(List<HistoriqueStatut> historique) { this.historique = historique; }
    public List<Paiement> getPaiements() { return paiements; }
    public void setPaiements(List<Paiement> paiements) { this.paiements = paiements; }

    // dateLimitePaiement = dateCreation + delaiReglement : dérivée, jamais saisie manuellement.
    @Transient
    public LocalDate getDateLimitePaiement() {
        return (dateCreation != null && delaiReglement != null)
                ? dateCreation.plusDays(delaiReglement)
                : null;
    }

    // montantRegle / reste : calculés à partir des paiements confirmés (voir MemoireService pour "reste",
    // qui a en plus besoin du montant dû calculé par FiscaliteService).
    @Transient
    public Long getMontantRegle() {
        if (paiements == null) return 0L;
        return paiements.stream()
                .filter(p -> p.getStatut() == StatutPaiement.CONFIRME)
                .mapToLong(Paiement::getMontant)
                .sum();
    }
}
