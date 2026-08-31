package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

// Sous-entité de Contrat, pertinente uniquement pour la branche AUTO.
@Entity
@Table(name = "vehicules")
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String immatriculation;
    private String marque;
    private String modele;
    private Integer anneeMiseEnCirculation;
    private String usage;

    @OneToOne
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImmatriculation() { return immatriculation; }
    public void setImmatriculation(String immatriculation) { this.immatriculation = immatriculation; }
    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }
    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
    public Integer getAnneeMiseEnCirculation() { return anneeMiseEnCirculation; }
    public void setAnneeMiseEnCirculation(Integer anneeMiseEnCirculation) { this.anneeMiseEnCirculation = anneeMiseEnCirculation; }
    public String getUsage() { return usage; }
    public void setUsage(String usage) { this.usage = usage; }
    public Contrat getContrat() { return contrat; }
    public void setContrat(Contrat contrat) { this.contrat = contrat; }
}
