package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "paiements")
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long montant; // millimes
    private LocalDate datePaiement;

    // "mode" est un mot reserve Oracle (verrouillage de lignes) : colonne renommee pour eviter ORA-00904.
    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement")
    private ModePaiement mode;

    @Enumerated(EnumType.STRING)
    private StatutPaiement statut;

    private String reference;

    @ManyToOne
    @JoinColumn(name = "memoire_id")
    private Memoire memoire;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMontant() { return montant; }
    public void setMontant(Long montant) { this.montant = montant; }
    public LocalDate getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDate datePaiement) { this.datePaiement = datePaiement; }
    public ModePaiement getMode() { return mode; }
    public void setMode(ModePaiement mode) { this.mode = mode; }
    public StatutPaiement getStatut() { return statut; }
    public void setStatut(StatutPaiement statut) { this.statut = statut; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Memoire getMemoire() { return memoire; }
    public void setMemoire(Memoire memoire) { this.memoire = memoire; }
}
