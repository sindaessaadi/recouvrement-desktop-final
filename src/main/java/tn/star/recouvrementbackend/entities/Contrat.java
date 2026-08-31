package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "CONTRATS")
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NUMERO_POLICE")
    private String numeroPolice;

    @ManyToOne
    @JoinColumn(name = "CLIENT_ID")
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(name = "BRANCHE")
    private Branche branche;

    @Column(name = "AGENCE")
    private String agence;

    @Column(name = "DATE_EFFET")
    private LocalDate dateEffet;

    @Column(name = "DATE_ECHEANCE_CONTRAT")
    private LocalDate dateEcheanceContrat;

    @Column(name = "PRIME_BRUTE")
    private Long primeBrute; // saisi, en millimes

    // Cascade/orphanRemoval conserves ici : ContratService.applyRequest() en depend directement
    // pour creer/mettre a jour/supprimer le Vehicule associe (verifie avant modification).
    // A reconfirmer avec la structure exacte de VEHICULES avant tout changement.
    @OneToOne(mappedBy = "contrat", cascade = CascadeType.ALL, orphanRemoval = true)
    private Vehicule vehicule; // uniquement branche AUTO

    // Cascade retire : les quittances sont creees/geres exclusivement via QuittanceService,
    // jamais a travers cette liste cote Contrat (meme principe que Client.java).
    @OneToMany(mappedBy = "contrat")
    private List<Quittance> quittances;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroPolice() { return numeroPolice; }
    public void setNumeroPolice(String numeroPolice) { this.numeroPolice = numeroPolice; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Branche getBranche() { return branche; }
    public void setBranche(Branche branche) { this.branche = branche; }
    public String getAgence() { return agence; }
    public void setAgence(String agence) { this.agence = agence; }
    public LocalDate getDateEffet() { return dateEffet; }
    public void setDateEffet(LocalDate dateEffet) { this.dateEffet = dateEffet; }
    public LocalDate getDateEcheanceContrat() { return dateEcheanceContrat; }
    public void setDateEcheanceContrat(LocalDate dateEcheanceContrat) { this.dateEcheanceContrat = dateEcheanceContrat; }
    public Long getPrimeBrute() { return primeBrute; }
    public void setPrimeBrute(Long primeBrute) { this.primeBrute = primeBrute; }
    public Vehicule getVehicule() { return vehicule; }
    public void setVehicule(Vehicule vehicule) { this.vehicule = vehicule; }
    public List<Quittance> getQuittances() { return quittances; }
    public void setQuittances(List<Quittance> quittances) { this.quittances = quittances; }

    // Calculé : pas encore de règle de réduction connue (à confirmer avec l'encadrant),
    // donc égale à la prime brute saisie pour l'instant. Ne jamais mapper en colonne JPA.
    @Transient
    public Long getPrimeNette() {
        return primeBrute;
    }
}
