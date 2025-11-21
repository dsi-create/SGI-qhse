import { UserRole } from '@/types';

/**
 * Mappe les rôles utilisateur aux postes pour la gestion des risques
 */
export const roleToPoste: Record<UserRole, string> = {
  agent_securite: 'Sécurité',
  agent_entretien: 'Entretien',
  technicien: 'Technique',
  superviseur_qhse: 'QHSE',
  superadmin: 'Tous', // L'admin voit tous les risques
  secretaire: 'Secrétariat',
  superviseur_agent_securite: 'Sécurité',
  superviseur_agent_entretien: 'Entretien',
  superviseur_technicien: 'Technique',
  medecin: 'Médecine',
  biomedical: 'Biomédical',
  dop: 'QHSE',
  employe: 'Général',
};

/**
 * Liste des postes disponibles pour la sélection
 */
export const availablePostes = [
  'Sécurité',
  'Entretien',
  'Technique',
  'QHSE',
  'Secrétariat',
  'Médecine',
  'Biomédical',
  'Général',
  'Tous', // Pour l'admin
];

/**
 * Détermine si un utilisateur peut voir un risque selon son poste
 */
export const canViewRisk = (userRole: UserRole, riskPoste?: string): boolean => {
  // L'admin voit tous les risques
  if (userRole === 'superadmin') {
    return true;
  }

  // Si le risque n'a pas de poste assigné, tous peuvent le voir (pour compatibilité)
  if (!riskPoste) {
    return true;
  }

  const userPoste = roleToPoste[userRole];
  
  // Si l'utilisateur a le poste "Tous" (admin), il voit tout
  if (userPoste === 'Tous') {
    return true;
  }

  // L'utilisateur voit les risques de son poste
  return riskPoste === userPoste;
};

/**
 * Détermine les postes qu'un superviseur peut voir
 */
export const getSupervisorPostes = (userRole: UserRole): string[] => {
  switch (userRole) {
    case 'superviseur_qhse':
      // Le superviseur QHSE voit tous les postes
      return availablePostes.filter(p => p !== 'Tous');
    case 'superviseur_agent_securite':
      return ['Sécurité'];
    case 'superviseur_agent_entretien':
      return ['Entretien'];
    case 'superviseur_technicien':
      return ['Technique'];
    default:
      return [];
  }
};



