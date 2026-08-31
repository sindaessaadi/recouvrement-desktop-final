export interface Utilisateur {
  id: number;
  nom: string;
  role: string;
  email: string;
  telephone: string;
  initiales: string;
  actif: boolean;
}

export interface Preferences {
  notificationsEmail: boolean;
  notificationsApp: boolean;
  alerteRelanceEchue: boolean;
  alerteImpaye: boolean;
  seuilAlerteImpaye: number;
  theme: 'clair' | 'sombre';
  langue: 'Francais' | 'Arabe' | 'English';
  densite: 'confort' | 'compact';
  formatDate: 'JJ/MM/AAAA' | 'AAAA-MM-JJ';
}

export interface Organisation {
  nomCompagnie: string;
  devise: 'DT' | 'EUR' | 'USD';
  prefixeNumerotationMemoires: string;
  delaiRelanceParDefaut: number;
  tauxTva: number;
  exerciceComptable: string;
}

export interface LogActivite {
  date: string;
  utilisateur: string;
  action: string;
}

export interface SessionActive {
  id: number;
  appareil: string;
  localisation: string;
  statut: 'active' | 'inactive';
  derniereActivite: string;
}