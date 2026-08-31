package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

// Config unique (une seule ligne en base) : parametres generaux de la compagnie.
@Entity
@Table(name = "organisation")
public class Organisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomCompagnie;
    private String devise;
    private String prefixeNumerotationMemoires;
    private Integer delaiRelanceParDefaut;
    private Double tauxTva;
    private String exerciceComptable;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomCompagnie() { return nomCompagnie; }
    public void setNomCompagnie(String nomCompagnie) { this.nomCompagnie = nomCompagnie; }
    public String getDevise() { return devise; }
    public void setDevise(String devise) { this.devise = devise; }
    public String getPrefixeNumerotationMemoires() { return prefixeNumerotationMemoires; }
    public void setPrefixeNumerotationMemoires(String prefixeNumerotationMemoires) { this.prefixeNumerotationMemoires = prefixeNumerotationMemoires; }
    public Integer getDelaiRelanceParDefaut() { return delaiRelanceParDefaut; }
    public void setDelaiRelanceParDefaut(Integer delaiRelanceParDefaut) { this.delaiRelanceParDefaut = delaiRelanceParDefaut; }
    public Double getTauxTva() { return tauxTva; }
    public void setTauxTva(Double tauxTva) { this.tauxTva = tauxTva; }
    public String getExerciceComptable() { return exerciceComptable; }
    public void setExerciceComptable(String exerciceComptable) { this.exerciceComptable = exerciceComptable; }
}
