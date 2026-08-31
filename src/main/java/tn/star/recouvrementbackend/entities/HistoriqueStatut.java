package tn.star.recouvrementbackend.entities;

import jakarta.persistence.*;

// Journal des étapes franchies par un mémoire, avec commentaire libre. Pas de date (par conception).
@Entity
@Table(name = "historiques_statuts")
public class HistoriqueStatut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EtapeMemoire etape;

    private String commentaire;

    @ManyToOne
    @JoinColumn(name = "memoire_id")
    private Memoire memoire;

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EtapeMemoire getEtape() { return etape; }
    public void setEtape(EtapeMemoire etape) { this.etape = etape; }
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
    public Memoire getMemoire() { return memoire; }
    public void setMemoire(Memoire memoire) { this.memoire = memoire; }
}
