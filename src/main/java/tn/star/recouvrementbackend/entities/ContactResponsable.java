package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "contacts_responsables")
public class ContactResponsable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String fonction;
    private String telephone;
    private String email;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getFonction() { return fonction; }
    public void setFonction(String fonction) { this.fonction = fonction; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
}
