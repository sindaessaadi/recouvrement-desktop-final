package tn.star.recouvrementbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.star.recouvrementbackend.dto.ClientRequest;
import tn.star.recouvrementbackend.dto.ClientResponse;
import tn.star.recouvrementbackend.dto.ContactResponsableResponse;
import tn.star.recouvrementbackend.dto.MemoireHistoriqueResponse;
import tn.star.recouvrementbackend.entities.Client;
import tn.star.recouvrementbackend.entities.ContactResponsable;
import tn.star.recouvrementbackend.entities.Contrat;
import tn.star.recouvrementbackend.entities.Memoire;
import tn.star.recouvrementbackend.entities.Paiement;
import tn.star.recouvrementbackend.entities.Quittance;
import tn.star.recouvrementbackend.entities.StatutPaiement;
import tn.star.recouvrementbackend.dto.ContactResponsableRequest;
import tn.star.recouvrementbackend.exception.ResourceNotFoundException;
import tn.star.recouvrementbackend.repository.ClientRepository;
import tn.star.recouvrementbackend.repository.ContactResponsableRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ContactResponsableRepository contactResponsableRepository;
    private final QuittanceService quittanceService;

    public ClientService(ClientRepository clientRepository,
                          ContactResponsableRepository contactResponsableRepository,
                          QuittanceService quittanceService) {
        this.clientRepository = clientRepository;
        this.contactResponsableRepository = contactResponsableRepository;
        this.quittanceService = quittanceService;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAll() {
        return clientRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public Client findEntity(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable : " + id));
    }

    @Transactional
    public ClientResponse create(ClientRequest request) {
        Client client = new Client();
        applyRequest(client, request);
        client = clientRepository.save(client);
        synchroniserContacts(client, request.contactsResponsables());
        return toResponse(client);
    }

    @Transactional
    public ClientResponse update(Long id, ClientRequest request) {
        Client client = findEntity(id);
        applyRequest(client, request);
        client = clientRepository.save(client);
        synchroniserContacts(client, request.contactsResponsables());
        return toResponse(client);
    }

    @Transactional
    public void delete(Long id) {
        clientRepository.delete(findEntity(id));
        clientRepository.flush();
    }

    private void applyRequest(Client client, ClientRequest request) {
        client.setNom(request.nom());
        client.setRaisonSociale(request.raisonSociale());
        client.setMatricule(request.matricule());
        client.setCin(request.cin());
        client.setTelephone(request.telephone());
        client.setEmail(request.email());
        client.setAdresse(request.adresse());
        client.setStatut(request.statut());
        client.setCharge(request.charge());
        client.setAnneeAppartenance(request.anneeAppartenance());
    }

    // Geree explicitement (pas de cascade/orphanRemoval sur Client.contactsResponsables, voir
    // l'entite) : on supprime les contacts existants et on recree ceux de la requete. Le client
    // doit deja avoir un id (appele apres le premier save).
    private void synchroniserContacts(Client client, List<ContactResponsableRequest> requests) {
        contactResponsableRepository.deleteAll(contactResponsableRepository.findByClientId(client.getId()));

        List<ContactResponsable> contacts = new ArrayList<>();
        if (requests != null) {
            requests.forEach(r -> {
                ContactResponsable contact = new ContactResponsable();
                contact.setNom(r.nom());
                contact.setFonction(r.fonction());
                contact.setTelephone(r.telephone());
                contact.setEmail(r.email());
                contact.setClient(client);
                contacts.add(contact);
            });
        }
        client.setContactsResponsables(contactResponsableRepository.saveAll(contacts));
    }

    @Transactional(readOnly = true)
    public Long getMontantImpaye(Client client) {
        if (client.getQuittances() == null) {
            return 0L;
        }
        return client.getQuittances().stream()
                .mapToLong(this::resteSurQuittance)
                .sum();
    }

    private long resteSurQuittance(Quittance quittance) {
        long montantDu = quittanceService.getMontantDu(quittance);
        long montantRegle = quittance.getMemoire() != null ? quittance.getMemoire().getMontantRegle() : 0L;
        return Math.max(0L, montantDu - montantRegle);
    }

    // Historique des memoires du client (ecran fiche client). Reste/montantDu recalcules
    // via QuittanceService/FiscaliteService, jamais dupliques.
    @Transactional(readOnly = true)
    public List<MemoireHistoriqueResponse> getMemoiresHistorique(Long clientId) {
        Client client = findEntity(clientId);
        if (client.getQuittances() == null) {
            return List.of();
        }
        List<MemoireHistoriqueResponse> historique = new ArrayList<>();
        for (Quittance quittance : client.getQuittances()) {
            Memoire memoire = quittance.getMemoire();
            if (memoire == null) {
                continue;
            }
            long montantDu = quittanceService.getMontantDu(quittance);
            long montantRegle = memoire.getMontantRegle();
            historique.add(new MemoireHistoriqueResponse(
                    memoire.getNumero(),
                    memoire.getDateLimitePaiement(),
                    montantDu,
                    montantRegle,
                    montantDu - montantRegle,
                    memoire.getStatut(),
                    dernierPaiementConfirme(memoire)
            ));
        }
        return historique;
    }

    private LocalDate dernierPaiementConfirme(Memoire memoire) {
        if (memoire.getPaiements() == null) {
            return null;
        }
        return memoire.getPaiements().stream()
                .filter(p -> p.getStatut() == StatutPaiement.CONFIRME && p.getDatePaiement() != null)
                .map(Paiement::getDatePaiement)
                .max(LocalDate::compareTo)
                .orElse(null);
    }

    public ClientResponse toResponse(Client client) {
        List<ContactResponsableResponse> contacts = client.getContactsResponsables() == null
                ? List.of()
                : client.getContactsResponsables().stream()
                    .map(c -> new ContactResponsableResponse(c.getId(), c.getNom(), c.getFonction(), c.getTelephone(), c.getEmail()))
                    .toList();

        List<String> polices = client.getContrats() == null
                ? List.of()
                : client.getContrats().stream().map(Contrat::getNumeroPolice).toList();

        String branche = client.getContrats() == null || client.getContrats().isEmpty()
                ? null
                : client.getContrats().get(0).getBranche().name();

        int nbMemoires = 0;
        long totalDu = 0L;
        long totalRegle = 0L;
        LocalDate dernierPaiement = null;

        if (client.getQuittances() != null) {
            for (Quittance quittance : client.getQuittances()) {
                totalDu += quittanceService.getMontantDu(quittance);
                Memoire memoire = quittance.getMemoire();
                if (memoire != null) {
                    nbMemoires++;
                    totalRegle += memoire.getMontantRegle();
                    LocalDate dernier = dernierPaiementConfirme(memoire);
                    if (dernier != null && (dernierPaiement == null || dernier.isAfter(dernierPaiement))) {
                        dernierPaiement = dernier;
                    }
                }
            }
        }
        int tauxRecouvrement = totalDu > 0 ? (int) Math.round(totalRegle * 100.0 / totalDu) : 0;

        return new ClientResponse(
                client.getId(),
                client.getNom(),
                client.getRaisonSociale(),
                client.getMatricule(),
                client.getCin(),
                client.getTelephone(),
                client.getEmail(),
                client.getAdresse(),
                client.getStatut(),
                client.getCharge(),
                client.getAnneeAppartenance(),
                getMontantImpaye(client),
                branche,
                polices,
                nbMemoires,
                tauxRecouvrement,
                dernierPaiement,
                0, // alertes : pas de fonctionnalite Relance implementee cote backend pour l'instant
                contacts
        );
    }
}
