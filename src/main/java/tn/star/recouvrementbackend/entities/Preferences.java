package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "preferences")
public class Preferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "utilisateur_id", unique = true)
    private Utilisateur utilisateur;

    private boolean notificationsEmail = true;
    private boolean notificationsApp = true;
    private boolean alerteRelanceEchue = true;
    private boolean alerteImpaye = false;
    private Integer seuilAlerteImpaye = 50;
    private String theme = "clair";
    private String langue = "Francais";
    private String densite = "confort";
    private String formatDate = "JJ/MM/AAAA";

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    public boolean isNotificationsEmail() { return notificationsEmail; }
    public void setNotificationsEmail(boolean notificationsEmail) { this.notificationsEmail = notificationsEmail; }
    public boolean isNotificationsApp() { return notificationsApp; }
    public void setNotificationsApp(boolean notificationsApp) { this.notificationsApp = notificationsApp; }
    public boolean isAlerteRelanceEchue() { return alerteRelanceEchue; }
    public void setAlerteRelanceEchue(boolean alerteRelanceEchue) { this.alerteRelanceEchue = alerteRelanceEchue; }
    public boolean isAlerteImpaye() { return alerteImpaye; }
    public void setAlerteImpaye(boolean alerteImpaye) { this.alerteImpaye = alerteImpaye; }
    public Integer getSeuilAlerteImpaye() { return seuilAlerteImpaye; }
    public void setSeuilAlerteImpaye(Integer seuilAlerteImpaye) { this.seuilAlerteImpaye = seuilAlerteImpaye; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getLangue() { return langue; }
    public void setLangue(String langue) { this.langue = langue; }
    public String getDensite() { return densite; }
    public void setDensite(String densite) { this.densite = densite; }
    public String getFormatDate() { return formatDate; }
    public void setFormatDate(String formatDate) { this.formatDate = formatDate; }
}
