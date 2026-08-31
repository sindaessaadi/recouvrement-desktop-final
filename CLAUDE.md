# Contexte du projet — Recouvrement STAR Assurances (Backend)

## Vue d'ensemble

Application de gestion du recouvrement des primes d'assurance impayées pour **STAR Assurances** (Tunisie), développée dans le cadre d'un stage.

- **Frontend** : Angular 18 (standalone components), déjà développé et fonctionnel, dans un dépôt séparé (`FRONTEND/recouvrement-desktop`)
- **Backend** : Spring Boot (Java), en cours de construction — projet `recouvrement-backend`
- **Base de données** : Oracle Database 19c (Standard Edition 2), instance `orcl`, listener sur le port `1522` (port `1521` déjà utilisé par une instance Oracle 11g XE existante sur le même poste)

Les identifiants de connexion (utilisateur applicatif, mots de passe) sont dans `application.properties`, volontairement **non versionné** — ne pas les redemander, ils sont déjà configurés localement.

## Métier — Le processus de recouvrement

Le processus suit une chaîne chronologique stricte de 4 dates, jamais dans le désordre :

```
1. Émission de la quittance     (date d'émission de la prime, fixée par la compagnie)
2. Échéance de la quittance     (date limite contractuelle de paiement)
3. Création du mémoire          (>= échéance — un mémoire ne peut être créé qu'après échéance dépassée)
4. Limite de paiement du mémoire (= date de création + délai de règlement choisi : 15/30/45/60 jours)
```

**Règle de validation obligatoire** : `dateCreation` du mémoire doit toujours être `>= dateEcheanceQuittance`. Un mémoire ne peut jamais être créé pour une quittance dont l'échéance n'est pas encore atteinte.

Un mémoire de règlement représente un dossier de recouvrement ouvert pour une quittance impayée. Il peut être réglé en une fois, en pourcentages, ou en tranches échelonnées.

## Règles fiscales (calculs de frais et taxes)

Ces calculs sont **dérivés**, jamais stockés comme colonnes figées — à recalculer à chaque fois à partir du montant net et de la branche :

```
Frais de police = montantNet × 3%
Assiette taxable = montantNet + fraisPolice

Taux TUA (Taxe Unique sur les Assurances) selon la branche :
  - AUTO, SANTÉ, IRDS : 12%
  - TRANSPORT         : 5%
  - VIE                : 0%

FGA (Fonds de Garantie Automobile), uniquement branche AUTO :
  FGA = montantNet × 2%

Taxe totale = (assiette × tauxTUA) + FGA
Total TTC = montantNet + fraisPolice + Taxe totale
```

## Entités principales et leurs champs

Voir le fichier `Liste_champs_entites_recouvrement.xlsx` (document de référence séparé) pour le détail complet des ~130 champs classés par origine :
- **Saisi** : renseigné par un utilisateur ou un import
- **Généré** : créé automatiquement par le système (ID, horodatage, numéro séquentiel)
- **Calculé** : **ne doit jamais être une colonne stockée** — recalculé à la volée (ex. `Memoire.reste`, `Quittance.statut`, `Client.montantImpaye`, `Contrat.primeNette`)

### Entités métier centrales
- **Client** — assuré (personne physique ou morale), avec sous-table `ContactResponsable` (relation 1-vers-plusieurs, un client peut avoir plusieurs interlocuteurs)
- **Contrat** — police d'assurance, avec sous-table `Vehicule` (uniquement pertinente pour la branche AUTO — chaque branche peut avoir ses propres champs complémentaires, à confirmer avec l'encadrant)
- **Quittance** — prime émise pour un contrat, statut IMPAYE/PAYE/EN_COURS_DE_PAIEMENT (calculé, pas stocké)
- **Memoire** — dossier de recouvrement créé pour une quittance impayée, avec sous-entités `Echeancier` (tranches de paiement) et `HistoriqueStatut` (journal des étapes franchies avec commentaires, sans date)
- **Paiement** — encaissement enregistré au titre d'un mémoire

### Entités internes à l'application (pas de données à extraire du système source)
- `Utilisateur` — comptes des gestionnaires/agents
- `Organisation` — paramètres généraux (config unique)
- `LogActivite` — journal d'audit
- `Relance` — créée par l'usage de l'app elle-même, pas un historique à importer

### Statuts et énumérations clés

```
Quittance.statut       : IMPAYE | PAYE | EN_COURS_DE_PAIEMENT
Memoire.statut          : EN_ATTENTE | PARTIEL | REGLE | ANNULE
Memoire.etapeActuelle   : PLANIFIE | EN_ATTENTE_DEPOT | DEPOSE | PAYE | CLOTURE
Paiement.statut         : Confirme | En_attente | Annule
Paiement.mode           : Virement bancaire | Cheque | Traite | Especes | Protocole
```

## Architecture backend (packages)

```
tn.star.recouvrementbackend/
├── entity/       -- classes JPA (@Entity)
├── repository/   -- interfaces Spring Data JPA
├── controller/   -- contrôleurs REST
└── RecouvrementBackendApplication.java
```

À venir au fur et à mesure : `service/` (logique métier, notamment les calculs fiscaux et la validation des dates), `dto/` (objets de transfert).

## État d'avancement

- ✅ Frontend Angular complet (9 écrans : Dashboard, Suivi émission, Création mémoire, Suivi des mémoires, Suivi des clients, Relances, Paiements, Reporting, Paramètres)
- ✅ Projet Spring Boot initialisé (Maven, Java 17, dépendances Web/JPA/Validation/Lombok/DevTools)
- ✅ Connexion Oracle 19c fonctionnelle en local (SQL*Plus confirme `STATUS = OPEN`)
- ⏳ Listener réseau Oracle 19c (port 1522) en cours de dépannage — la base fonctionne, seul l'accès réseau externe est instable pour le moment
- ⏳ Entités JPA pas encore créées — prochaine étape : `Client.java`

## Conventions de code à respecter

- Noms de classes/champs en anglais/français mixte cohérent avec l'existant (voir tableau Excel des entités pour les noms exacts de champs)
- Toujours utiliser `@Entity`, `@Table(name = "...")`, `@Id @GeneratedValue` pour les clés primaires
- Les champs "Calculé" (voir tableau Excel) ne doivent **jamais** être mappés comme colonnes JPA persistées — soit des méthodes `@Transient`, soit calculés côté service
- Devise de référence : DT (Dinar Tunisien), montants stockés en millimes (× 1000) côté Angular — à clarifier/aligner côté backend selon convention choisie
