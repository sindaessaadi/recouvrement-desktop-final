export type RoleUtilisateur = 'ADMIN' | 'GESTIONNAIRE' | 'CONSULTATION';

export const LABELS_ROLE: Record<RoleUtilisateur, string> = {
  ADMIN: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire',
  CONSULTATION: 'Consultation',
};

export interface UtilisateurCourant {
  id: number;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  telephone: string;
  actif: boolean;
  initiales: string;
}
