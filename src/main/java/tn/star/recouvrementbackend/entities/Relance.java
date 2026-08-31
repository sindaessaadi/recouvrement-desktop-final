package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "relances")
public class Relance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateHeure;

    @Enumerated(EnumType.STRING)
    private TypeRelance type;

    private String canal;
    private String utilisateur; // agent a l'origine de la relance, ou "Systeme" pour les evenements automatiques
    private String resultat;

    @Column(length = 1000)
    private String message;

    @ManyToOne
    @JoinColumn(name = "memoire_id")
    private Memoire memoire;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }
    public TypeRelance getType() { return type; }
    public void setType(TypeRelance type) { this.type = type; }
    public String getCanal() { return canal; }
    public void setCanal(String canal) { this.canal = canal; }
    public String getUtilisateur() { return utilisateur; }
    public void setUtilisateur(String utilisateur) { this.utilisateur = utilisateur; }
    public String getResultat() { return resultat; }
    public void setResultat(String resultat) { this.resultat = resultat; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Memoire getMemoire() { return memoire; }
    public void setMemoire(Memoire memoire) { this.memoire = memoire; }
}
