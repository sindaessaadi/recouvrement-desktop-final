package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String jti;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    private String appareil;
    private String adresseIp;
    private LocalDateTime dateConnexion;
    private LocalDateTime derniereActivite;
    private boolean actif = true;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getJti() { return jti; }
    public void setJti(String jti) { this.jti = jti; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    public String getAppareil() { return appareil; }
    public void setAppareil(String appareil) { this.appareil = appareil; }
    public String getAdresseIp() { return adresseIp; }
    public void setAdresseIp(String adresseIp) { this.adresseIp = adresseIp; }
    public LocalDateTime getDateConnexion() { return dateConnexion; }
    public void setDateConnexion(LocalDateTime dateConnexion) { this.dateConnexion = dateConnexion; }
    public LocalDateTime getDerniereActivite() { return derniereActivite; }
    public void setDerniereActivite(LocalDateTime derniereActivite) { this.derniereActivite = derniereActivite; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
