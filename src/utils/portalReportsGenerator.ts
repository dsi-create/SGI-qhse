import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  User, 
  Incident, 
  Visitor, 
  PlannedTask, 
  Booking, 
  BiomedicalEquipment, 
  MaintenanceTask,
  Users,
  Doctor,
  Room
} from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PortalReportData {
  user: User;
  incidents?: Incident[];
  visitors?: Visitor[];
  plannedTasks?: PlannedTask[];
  bookings?: Booking[];
  biomedicalEquipment?: BiomedicalEquipment[];
  maintenanceTasks?: MaintenanceTask[];
  users?: Users;
  rooms?: Room[];
  doctors?: Doctor[];
}

const createReportHTML = (
  portalType: string,
  data: PortalReportData
): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#333';
  container.style.backgroundColor = '#ffffff';

  const today = new Date();
  let html = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px;">
      <h1 style="font-size: 28px; margin: 0; color: #0ea5e9;">Rapport Complet - ${getPortalTitle(portalType)}</h1>
      <p style="font-size: 14px; margin: 5px 0; color: #666;">
        Généré le ${format(today, 'dd MMMM yyyy à HH:mm', { locale: fr })}
      </p>
      <p style="font-size: 14px; margin: 5px 0; color: #666;">
        Par: ${data.user.civility} ${data.user.first_name} ${data.user.last_name} (${data.user.role})
      </p>
    </div>
  `;

  // Génération du contenu selon le type de portail
  switch (portalType) {
    case 'superadmin':
      html += generateSuperAdminReport(data);
      break;
    case 'biomedical':
      html += generateBiomedicalReport(data);
      break;
    case 'superviseur_qhse':
      html += generateQHSEReport(data);
      break;
    case 'superviseur_securite':
      html += generateSecurityReport(data);
      break;
    case 'superviseur_entretien':
      html += generateMaintenanceReport(data);
      break;
    case 'superviseur_technicien':
      html += generateTechnicalReport(data);
      break;
    case 'secretaire':
      html += generateSecretaryReport(data);
      break;
    case 'medecin':
      html += generateDoctorReport(data);
      break;
    default:
      html += generateGenericReport(data);
  }

  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

const getPortalTitle = (portalType: string): string => {
  const titles: Record<string, string> = {
    'superadmin': 'Super Administrateur',
    'biomedical': 'Biomédical',
    'superviseur_qhse': 'Superviseur QHSE',
    'superviseur_securite': 'Superviseur Sécurité',
    'superviseur_entretien': 'Superviseur Entretien',
    'superviseur_technicien': 'Superviseur Technique',
    'secretaire': 'Secrétaire Médicale',
    'medecin': 'Médecin',
    'agent_securite': 'Agent de Sécurité',
    'agent_entretien': 'Agent d\'Entretien',
    'technicien': 'Technicien',
  };
  return titles[portalType] || 'Portail';
};

const generateSuperAdminReport = (data: PortalReportData): string => {
  const today = new Date();
  const todayStr = today.toDateString();
  
  const stats = {
    totalUsers: data.users ? Object.keys(data.users).length : 0,
    todayIncidents: data.incidents?.filter(i => new Date(i.date_creation).toDateString() === todayStr).length || 0,
    todayVisitors: data.visitors?.filter(v => new Date(v.entry_time).toDateString() === todayStr).length || 0,
    activeBookings: data.bookings?.filter(b => b.status === 'réservé' || b.status === 'en_cours').length || 0,
    totalIncidents: data.incidents?.length || 0,
    totalVisitors: data.visitors?.length || 0,
  };

  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Vue d'Ensemble Globale
      </h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Utilisateurs Actifs</div>
          <div style="font-size: 24px; font-weight: bold; color: #0ea5e9;">${stats.totalUsers}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Incidents Aujourd'hui</div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.todayIncidents}</div>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Visiteurs Aujourd'hui</div>
          <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${stats.todayVisitors}</div>
        </div>
      </div>
    </div>
  `;

  if (data.incidents && data.incidents.length > 0) {
    html += generateIncidentsTable(data.incidents.slice(0, 20), 'Incidents Récents');
  }

  if (data.visitors && data.visitors.length > 0) {
    html += generateVisitorsTable(data.visitors.slice(0, 20), 'Visiteurs Récents');
  }

  return html;
};

const generateBiomedicalReport = (data: PortalReportData): string => {
  const stats = {
    total: data.biomedicalEquipment?.length || 0,
    operational: data.biomedicalEquipment?.filter(eq => eq.status === 'opérationnel').length || 0,
    maintenance: data.biomedicalEquipment?.filter(eq => eq.status === 'en_maintenance').length || 0,
    outOfService: data.biomedicalEquipment?.filter(eq => eq.status === 'hors_service').length || 0,
  };

  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Statistiques du Parc Biomédical
      </h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Équipements</div>
          <div style="font-size: 24px; font-weight: bold; color: #0ea5e9;">${stats.total}</div>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Opérationnels</div>
          <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${stats.operational}</div>
        </div>
        <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">En Maintenance</div>
          <div style="font-size: 24px; font-weight: bold; color: #eab308;">${stats.maintenance}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Hors Service</div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.outOfService}</div>
        </div>
      </div>
    </div>
  `;

  if (data.biomedicalEquipment && data.biomedicalEquipment.length > 0) {
    html += generateEquipmentTable(data.biomedicalEquipment);
  }

  if (data.maintenanceTasks && data.maintenanceTasks.length > 0) {
    html += generateMaintenanceTasksTable(data.maintenanceTasks);
  }

  if (data.incidents && data.incidents.length > 0) {
    const biomedicalIncidents = data.incidents.filter(i => i.service === 'biomedical');
    html += generateIncidentsTable(biomedicalIncidents, 'Déclarations d\'Équipements en Panne');
  }

  return html;
};

const generateQHSEReport = (data: PortalReportData): string => {
  const today = new Date();
  const todayStr = today.toDateString();
  
  const stats = {
    total: data.incidents?.length || 0,
    today: data.incidents?.filter(i => new Date(i.date_creation).toDateString() === todayStr).length || 0,
    nouveau: data.incidents?.filter(i => i.statut === 'nouveau').length || 0,
    cours: data.incidents?.filter(i => i.statut === 'cours').length || 0,
    traite: data.incidents?.filter(i => i.statut === 'traite').length || 0,
    resolu: data.incidents?.filter(i => i.statut === 'resolu').length || 0,
  };

  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Statistiques QHSE
      </h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Incidents</div>
          <div style="font-size: 24px; font-weight: bold; color: #0ea5e9;">${stats.total}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Aujourd'hui</div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.today}</div>
        </div>
        <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">En Cours</div>
          <div style="font-size: 24px; font-weight: bold; color: #eab308;">${stats.cours}</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Nouveaux</div>
          <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.nouveau}</div>
        </div>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Traités</div>
          <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.traite}</div>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Résolus</div>
          <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${stats.resolu}</div>
        </div>
      </div>
    </div>
  `;

  if (data.incidents && data.incidents.length > 0) {
    html += generateIncidentsTable(data.incidents, 'Tous les Incidents');
  }

  return html;
};

const generateSecurityReport = (data: PortalReportData): string => {
  const securityIncidents = data.incidents?.filter(i => i.service === 'securite') || [];
  const today = new Date();
  const todayStr = today.toDateString();
  
  const stats = {
    total: securityIncidents.length,
    today: securityIncidents.filter(i => new Date(i.date_creation).toDateString() === todayStr).length,
    critique: securityIncidents.filter(i => i.priorite === 'critique').length,
    haute: securityIncidents.filter(i => i.priorite === 'haute').length,
  };

  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Statistiques Sécurité
      </h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Incidents</div>
          <div style="font-size: 24px; font-weight: bold; color: #0ea5e9;">${stats.total}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Aujourd'hui</div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.today}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Critique</div>
          <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.critique}</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Haute Priorité</div>
          <div style="font-size: 24px; font-weight: bold; color: #f97316;">${stats.haute}</div>
        </div>
      </div>
    </div>
  `;

  if (securityIncidents.length > 0) {
    html += generateIncidentsTable(securityIncidents, 'Incidents de Sécurité');
  }

  return html;
};

const generateMaintenanceReport = (data: PortalReportData): string => {
  const maintenanceIncidents = data.incidents?.filter(i => i.service === 'entretien') || [];
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Rapport Entretien
      </h2>
    </div>
  `;

  if (maintenanceIncidents.length > 0) {
    html += generateIncidentsTable(maintenanceIncidents, 'Incidents d\'Entretien');
  }

  if (data.plannedTasks && data.plannedTasks.length > 0) {
    html += generatePlannedTasksTable(data.plannedTasks);
  }

  return html;
};

const generateTechnicalReport = (data: PortalReportData): string => {
  const technicalIncidents = data.incidents?.filter(i => i.service === 'technique') || [];
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Rapport Technique
      </h2>
    </div>
  `;

  if (technicalIncidents.length > 0) {
    html += generateIncidentsTable(technicalIncidents, 'Incidents Techniques');
  }

  return html;
};

const generateSecretaryReport = (data: PortalReportData): string => {
  const today = new Date();
  const todayBookings = data.bookings?.filter(b => 
    format(b.start_time, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  ) || [];
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Rapport Secrétariat
      </h2>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Réservations Aujourd'hui</div>
        <div style="font-size: 28px; font-weight: bold; color: #0ea5e9;">${todayBookings.length}</div>
      </div>
    </div>
  `;

  if (data.bookings && data.bookings.length > 0) {
    html += generateBookingsTable(data.bookings.slice(0, 50), data.rooms, data.users);
  }

  if (data.visitors && data.visitors.length > 0) {
    html += generateVisitorsTable(data.visitors.slice(0, 20));
  }

  return html;
};

const generateDoctorReport = (data: PortalReportData): string => {
  const today = new Date();
  const todayBookings = data.bookings?.filter(b => 
    format(b.start_time, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  ) || [];
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #0ea5e9; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
        Rapport Médecin
      </h2>
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Consultations Aujourd'hui</div>
        <div style="font-size: 28px; font-weight: bold; color: #0ea5e9;">${todayBookings.length}</div>
      </div>
    </div>
  `;

  if (data.bookings && data.bookings.length > 0) {
    html += generateBookingsTable(data.bookings.slice(0, 30), data.rooms, data.users);
  }

  return html;
};

const generateGenericReport = (data: PortalReportData): string => {
  let html = `<div style="margin-bottom: 30px;"><h2 style="font-size: 20px; color: #0ea5e9;">Résumé</h2></div>`;
  
  if (data.incidents && data.incidents.length > 0) {
    html += generateIncidentsTable(data.incidents.slice(0, 20), 'Mes Incidents');
  }
  
  return html;
};

const generateIncidentsTable = (incidents: Incident[], title: string): string => {
  if (incidents.length === 0) return '';

  const statusColors: Record<string, string> = {
    nouveau: '#3b82f6',
    cours: '#eab308',
    traite: '#14b8a6',
    resolu: '#22c55e',
    attente: '#f97316',
  };

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        ${title} (${incidents.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Type</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Lieu</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Priorité</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Statut</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map(incident => `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${format(incident.date_creation, 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${incident.type}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${incident.lieu || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getPriorityColor(incident.priorite)}; color: white;">
                  ${incident.priorite}
                </span>
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${statusColors[incident.statut] || '#6b7280'}; color: white;">
                  ${incident.statut}
                </span>
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db; max-width: 200px; word-wrap: break-word;">${incident.description?.substring(0, 100) || '-'}${incident.description && incident.description.length > 100 ? '...' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateEquipmentTable = (equipment: BiomedicalEquipment[]): string => {
  if (equipment.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        Parc d'Équipements (${equipment.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Nom</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Modèle</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">N° Série</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Localisation</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Statut</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Prochaine Maintenance</th>
          </tr>
        </thead>
        <tbody>
          ${equipment.map(eq => `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${eq.name}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${eq.model || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${eq.serial_number || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${eq.location || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getEquipmentStatusColor(eq.status)}; color: white;">
                  ${eq.status}
                </span>
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${eq.next_maintenance ? format(new Date(eq.next_maintenance), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateMaintenanceTasksTable = (tasks: MaintenanceTask[]): string => {
  if (tasks.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        Tâches de Maintenance (${tasks.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Type</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date Planifiée</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Statut</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${task.type}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${format(new Date(task.scheduled_date), 'dd/MM/yyyy', { locale: fr })}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getTaskStatusColor(task.status)}; color: white;">
                  ${task.status}
                </span>
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db; max-width: 200px; word-wrap: break-word;">${task.description?.substring(0, 100) || '-'}${task.description && task.description.length > 100 ? '...' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateBookingsTable = (bookings: Booking[], rooms: Room[] = [], users: Users = {}): string => {
  if (bookings.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        Réservations (${bookings.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Heure</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Salle</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Objet</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Réservé par</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.sort((a, b) => a.start_time.getTime() - b.start_time.getTime()).map(booking => {
            const room = rooms?.find(r => r.id === booking.room_id);
            const user = users ? Object.values(users).find(u => u.id === booking.booked_by) : undefined;
            return `
              <tr>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${format(booking.start_time, 'dd/MM/yyyy', { locale: fr })}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${format(booking.start_time, 'HH:mm')} - ${format(booking.end_time, 'HH:mm')}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${room?.name || 'Inconnue'}${room?.location ? ` (${room.location})` : ''}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${booking.title}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Inconnu'}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getBookingStatusColor(booking.status)}; color: white;">
                    ${booking.status}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateVisitorsTable = (visitors: Visitor[], title: string = 'Visiteurs'): string => {
  if (visitors.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        ${title} (${visitors.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date Entrée</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Nom</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Visité</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Motif</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date Sortie</th>
          </tr>
        </thead>
        <tbody>
          ${visitors.map(visitor => `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${format(visitor.entry_time, 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${visitor.first_name} ${visitor.last_name}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${visitor.visitee_name || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${visitor.reason || '-'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${visitor.exit_time ? format(visitor.exit_time, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'En cours'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generatePlannedTasksTable = (tasks: PlannedTask[]): string => {
  if (tasks.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        Tâches Planifiées (${tasks.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Titre</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Priorité</th>
            <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${task.title}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getPriorityColor(task.priority)}; color: white;">
                  ${task.priority}
                </span>
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; background: ${getTaskStatusColor(task.status)}; color: white;">
                  ${task.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    critique: '#dc2626',
    haute: '#f97316',
    moyenne: '#eab308',
    faible: '#22c55e',
  };
  return colors[priority] || '#6b7280';
};

const getEquipmentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'opérationnel': '#22c55e',
    'en_maintenance': '#eab308',
    'hors_service': '#ef4444',
  };
  return colors[status] || '#6b7280';
};

const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'planifiée': '#3b82f6',
    'en_cours': '#eab308',
    'terminée': '#22c55e',
    'annulée': '#6b7280',
    'à_faire': '#3b82f6',
    'en_progrès': '#eab308',
    'terminée': '#22c55e',
  };
  return colors[status] || '#6b7280';
};

const getBookingStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'réservé': '#3b82f6',
    'en_cours': '#22c55e',
    'terminé': '#6b7280',
    'annulé': '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const generatePortalReportPDF = async (
  portalType: string,
  data: PortalReportData
): Promise<void> => {
  const reportElement = createReportHTML(portalType, data);

  try {
    const canvas = await html2canvas(reportElement, { 
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;

    // Ajouter la première page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    // Ajouter des pages supplémentaires si nécessaire
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    const fileName = `rapport-${portalType}-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: fr })}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  } finally {
    if (reportElement.parentNode) {
      document.body.removeChild(reportElement);
    }
  }
};

