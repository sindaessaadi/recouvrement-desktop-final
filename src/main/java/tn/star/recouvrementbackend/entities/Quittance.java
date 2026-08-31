package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "quittances")
public class Quittance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String identifiant;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    private String agence;
    private LocalDate emission;
    private LocalDate echeance;
    private Long montantNet; // en millimes, comme côté Angular

    // Recalcules et persistes a chaque creation/modification (voir QuittanceService.applyRequest) a
    // partir de montantNet + branche du contrat, via le point de calcul unique FiscaliteService.
    // Derogation ponctuelle a la regle CLAUDE.md "jamais de colonne calculee figee", a la demande
    // explicite du projet pour cette entite.
    private Long fraisPolice;
    private Long taxe;
    private Long fga;

    private LocalDate derniereRelance;

    @OneToOne(mappedBy = "quittance", cascade = CascadeType.ALL)
    private Memoire memoire;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIdentifiant() { return identifiant; }
    public void setIdentifiant(String identifiant) { this.identifiant = identifiant; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Contrat getContrat() { return contrat; }
    public void setContrat(Contrat contrat) { this.contrat = contrat; }
    public String getAgence() { return agence; }
    public void setAgence(String agence) { this.agence = agence; }
    public LocalDate getEmission() { return emission; }
    public void setEmission(LocalDate emission) { this.emission = emission; }
    public LocalDate getEcheance() { return echeance; }
    public void setEcheance(LocalDate echeance) { this.echeance = echeance; }
    public Long getMontantNet() { return montantNet; }
    public void setMontantNet(Long montantNet) { this.montantNet = montantNet; }
    public Long getFraisPolice() { return fraisPolice; }
    public void setFraisPolice(Long fraisPolice) { this.fraisPolice = fraisPolice; }
    public Long getTaxe() { return taxe; }
    public void setTaxe(Long taxe) { this.taxe = taxe; }
    public Long getFga() { return fga; }
    public void setFga(Long fga) { this.fga = fga; }
    public LocalDate getDerniereRelance() { return derniereRelance; }
    public void setDerniereRelance(LocalDate derniereRelance) { this.derniereRelance = derniereRelance; }
    public Memoire getMemoire() { return memoire; }
    public void setMemoire(Memoire memoire) { this.memoire = memoire; }

    // hasMemoire, statut, montantDu : calculés, jamais persistés (voir QuittanceService / FiscaliteService).
    @Transient
    public boolean isHasMemoire() {
        return memoire != null;
    }
}
