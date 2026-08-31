package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "echeanciers")
public class Echeancier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer ordre;
    private Long montant; // millimes
    private LocalDate dateEcheance;
    private boolean reglee;

    @ManyToOne
    @JoinColumn(name = "memoire_id")
    private Memoire memoire;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
    public Long getMontant() { return montant; }
    public void setMontant(Long montant) { this.montant = montant; }
    public LocalDate getDateEcheance() { return dateEcheance; }
    public void setDateEcheance(LocalDate dateEcheance) { this.dateEcheance = dateEcheance; }
    public boolean isReglee() { return reglee; }
    public void setReglee(boolean reglee) { this.reglee = reglee; }
    public Memoire getMemoire() { return memoire; }
    public void setMemoire(Memoire memoire) { this.memoire = memoire; }
}
