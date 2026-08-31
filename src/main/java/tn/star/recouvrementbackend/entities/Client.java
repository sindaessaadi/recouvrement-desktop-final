package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "CLIENTS")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOM")
    private String nom;

    @Column(name = "RAISON_SOCIALE")
    private String raisonSociale;

    @Column(name = "MATRICULE")
    private String matricule;

    @Column(name = "CIN")
    private String cin;

    @Column(name = "TELEPHONE")
    private String telephone;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "ADRESSE")
    private String adresse;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUT")
    private StatutClient statut;

    @Column(name = "CHARGE")
    private String charge;

    @Column(name = "ANNEE_APPARTENANCE")
    private Integer anneeAppartenance;

    // Cascade/orphanRemoval volontairement absents pour l'instant : la base contient des donnees
    // reelles de test, on evite qu'une suppression/modification cote Client se propage aux entites
    // liees tant que le flux lecture Oracle -> Spring -> Angular n'est pas pleinement stabilise.
    @OneToMany(mappedBy = "client")
    private List<ContactResponsable> contactsResponsables;

    @OneToMany(mappedBy = "client")
    private List<Contrat> contrats;

    @OneToMany(mappedBy = "client")
    private List<Quittance> quittances;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getRaisonSociale() { return raisonSociale; }
    public void setRaisonSociale(String raisonSociale) { this.raisonSociale = raisonSociale; }
    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public StatutClient getStatut() { return statut; }
    public void setStatut(StatutClient statut) { this.statut = statut; }
    public String getCharge() { return charge; }
    public void setCharge(String charge) { this.charge = charge; }
    public Integer getAnneeAppartenance() { return anneeAppartenance; }
    public void setAnneeAppartenance(Integer anneeAppartenance) { this.anneeAppartenance = anneeAppartenance; }
    public List<ContactResponsable> getContactsResponsables() { return contactsResponsables; }
    public void setContactsResponsables(List<ContactResponsable> contactsResponsables) { this.contactsResponsables = contactsResponsables; }
    public List<Contrat> getContrats() { return contrats; }
    public void setContrats(List<Contrat> contrats) { this.contrats = contrats; }
    public List<Quittance> getQuittances() { return quittances; }
    public void setQuittances(List<Quittance> quittances) { this.quittances = quittances; }
}
