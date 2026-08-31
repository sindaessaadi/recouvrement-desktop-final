package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Column(unique = true)
    private String email;

    private String motDePasse; // haché (BCrypt), jamais en clair

    @Enumerated(EnumType.STRING)
    private RoleUtilisateur role;

    private String telephone;
    private boolean actif = true;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    public RoleUtilisateur getRole() { return role; }
    public void setRole(RoleUtilisateur role) { this.role = role; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    // Initiales calculees a partir du nom (ex. "Fatma Ayari" -> "FA") : jamais persistees.
    @Transient
    public String getInitiales() {
        if (nom == null || nom.isBlank()) {
            return "";
        }
        String[] parties = nom.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parties) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0)));
            }
        }
        return sb.length() > 2 ? sb.substring(0, 2) : sb.toString();
    }
}
