import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReportType } from '@/components/qhse/QHSEReportsModule';

const LOGO_URL = 'https://res.cloudinary.com/dd64mwkl2/image/upload/v1758286702/Centre_Diagnostic-Logo_xhxxpv.png';

interface QHSEReportData {
  user: any;
  data: {
    incidents: any[];
    audits: any[];
    trainings: any[];
    medicalWaste: any[];
    risks: any[];
    sterilizationCycles: any[];
    sterilizationRegister: any[];
    laundryTracking: any[];
  };
  stats: any;
  dateRange: {
    start: string;
    end: string;
  };
}

const createReportHTML = (
  reportType: ReportType,
  data: QHSEReportData
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
    <div style="margin-bottom: 20px; border-bottom: 2px solid #06b6d4; padding-bottom: 15px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <div style="flex: 1;">
          <img src="${LOGO_URL}" alt="Logo" style="height: 40px; max-width: 150px; object-fit: contain;" />
        </div>
        <div style="flex: 2; text-align: center;">
          <h1 style="font-size: 20px; margin: 0; color: #06b6d4; font-weight: bold;">Rapport QHSE</h1>
          <h2 style="font-size: 14px; margin: 3px 0; color: #0891b2; font-weight: 600;">${getReportTypeTitle(reportType)}</h2>
        </div>
        <div style="flex: 1;"></div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px;">
        <div>
          <p style="font-size: 10px; margin: 2px 0; color: #666; font-weight: bold;">Généré le</p>
          <p style="font-size: 11px; margin: 0; color: #333;">${format(today, 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
        </div>
        <div>
          <p style="font-size: 10px; margin: 2px 0; color: #666; font-weight: bold;">Généré par</p>
          <p style="font-size: 11px; margin: 0; color: #333;">${data.user.civility} ${data.user.first_name} ${data.user.last_name}</p>
          <p style="font-size: 10px; margin: 1px 0; color: #666;">(${data.user.role})</p>
        </div>
        <div>
          <p style="font-size: 10px; margin: 2px 0; color: #666; font-weight: bold;">Période analysée</p>
          <p style="font-size: 11px; margin: 0; color: #333;">Du ${format(new Date(data.dateRange.start), 'dd MMMM yyyy', { locale: fr })}</p>
          <p style="font-size: 11px; margin: 0; color: #333;">au ${format(new Date(data.dateRange.end), 'dd MMMM yyyy', { locale: fr })}</p>
        </div>
        <div>
          <p style="font-size: 10px; margin: 2px 0; color: #666; font-weight: bold;">Durée de la période</p>
          <p style="font-size: 11px; margin: 0; color: #333;">${Math.ceil((new Date(data.dateRange.end).getTime() - new Date(data.dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} jours</p>
        </div>
      </div>
    </div>
  `;

  // Génération du contenu selon le type de rapport
  switch (reportType) {
    case 'overview':
      html += generateOverviewReport(data);
      break;
    case 'incidents':
      html += generateIncidentsReport(data);
      break;
    case 'audits':
      html += generateAuditsReport(data);
      break;
    case 'trainings':
      html += generateTrainingsReport(data);
      break;
    case 'medical_waste':
      html += generateMedicalWasteReport(data);
      break;
    case 'risks':
      html += generateRisksReport(data);
      break;
    case 'sterilization':
      html += generateSterilizationReport(data);
      break;
    case 'laundry':
      html += generateLaundryReport(data);
      break;
    case 'comprehensive':
      html += generateComprehensiveReport(data);
      break;
  }

  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

const getReportTypeTitle = (reportType: ReportType): string => {
  const titles: Record<ReportType, string> = {
    'overview': 'Vue d\'ensemble',
    'incidents': 'Incidents & Tickets',
    'audits': 'Audits & Inspections',
    'trainings': 'Formations',
    'medical_waste': 'Déchets Médicaux',
    'risks': 'Gestion des Risques',
    'sterilization': 'Stérilisation',
    'laundry': 'Suivi de Linge',
    'comprehensive': 'Rapport Complet',
  };
  return titles[reportType] || 'Rapport QHSE';
};

const generateOverviewReport = (data: QHSEReportData): string => {
  const { stats, data: reportData } = data;
  
  // Calcul des KPIs
  const incidentResolutionRate = stats.incidents.total > 0 
    ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1)
    : '0';
  const auditConformityRate = stats.audits.conformityRate || '0';
  const riskTreatmentRate = stats.risks.total > 0
    ? ((stats.risks.traite / stats.risks.total) * 100).toFixed(1)
    : '0';
  const sterilizationSuccessRate = stats.sterilization.successRate || '0';
  
  return `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Vue d'Ensemble QHSE
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 10px; border-left: 5px solid #06b6d4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Incidents</div>
          <div style="font-size: 32px; font-weight: bold; color: #06b6d4; margin-bottom: 5px;">${stats.incidents.total}</div>
          <div style="font-size: 10px; color: #666;">
            ${stats.incidents.nouveau} nouveau${stats.incidents.nouveau > 1 ? 'x' : ''} | ${stats.incidents.cours} en cours | ${stats.incidents.resolu} résolu${stats.incidents.resolu > 1 ? 's' : ''}
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 20px; border-radius: 10px; border-left: 5px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Audits</div>
          <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 5px;">${stats.audits.total}</div>
          <div style="font-size: 10px; color: #666;">
            ${stats.audits.planifie} planifié${stats.audits.planifie > 1 ? 's' : ''} | ${stats.audits.en_cours} en cours | ${stats.audits.termine} terminé${stats.audits.termine > 1 ? 's' : ''}
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); padding: 20px; border-radius: 10px; border-left: 5px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Formations</div>
          <div style="font-size: 32px; font-weight: bold; color: #8b5cf6; margin-bottom: 5px;">${stats.trainings.total}</div>
          <div style="font-size: 10px; color: #666;">
            ${stats.trainings.planifiee} planifiée${stats.trainings.planifiee > 1 ? 's' : ''} | ${stats.trainings.en_cours} en cours | ${stats.trainings.terminee} terminée${stats.trainings.terminee > 1 ? 's' : ''}
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 10px; border-left: 5px solid #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Risques</div>
          <div style="font-size: 32px; font-weight: bold; color: #ef4444; margin-bottom: 5px;">${stats.risks.total}</div>
          <div style="font-size: 10px; color: #666;">
            ${stats.risks.identifie} identifié${stats.risks.identifie > 1 ? 's' : ''} | ${stats.risks.en_traitement} en traitement | ${stats.risks.traite} traité${stats.risks.traite > 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      <!-- Indicateurs de Performance -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance Clés (KPIs)</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Résolution</div>
            <div style="font-size: 24px; font-weight: bold; color: #06b6d4;">${incidentResolutionRate}%</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Incidents</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Conformité</div>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${auditConformityRate}%</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Audits</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Traitement</div>
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${riskTreatmentRate}%</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Risques</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Réussite</div>
            <div style="font-size: 24px; font-weight: bold; color: #0891b2;">${sterilizationSuccessRate}%</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Stérilisation</div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques supplémentaires -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Déchets Médicaux</div>
          <div style="font-size: 24px; font-weight: bold; color: #f97316;">${stats.medicalWaste.total}</div>
          <div style="font-size: 10px; color: #666;">${stats.medicalWaste.collecte} collecté${stats.medicalWaste.collecte > 1 ? 's' : ''} | ${stats.medicalWaste.traite} traité${stats.medicalWaste.traite > 1 ? 's' : ''}</div>
        </div>
        <div style="background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Stérilisation</div>
          <div style="font-size: 24px; font-weight: bold; color: #06b6d4;">${stats.sterilization.cycles + stats.sterilization.register}</div>
          <div style="font-size: 10px; color: #666;">${stats.sterilization.cycles} cycles | ${stats.sterilization.register} registres</div>
        </div>
        <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #64748b; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 11px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Suivi de Linge</div>
          <div style="font-size: 24px; font-weight: bold; color: #64748b;">${stats.laundry.total}</div>
          <div style="font-size: 10px; color: #666;">Suivis enregistrés</div>
        </div>
      </div>
      
      <!-- Synthèse Exécutive -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #06b6d4;">
        <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: bold;">Synthèse Exécutive</h3>
        <p style="font-size: 11px; color: #475569; line-height: 1.5; margin: 0;">
          <strong>${stats.incidents.total + stats.audits.total + stats.trainings.total + stats.risks.total}</strong> activités QHSE enregistrées 
          (${stats.incidents.total} incidents, ${stats.audits.total} audits, ${stats.trainings.total} formations, ${stats.risks.total} risques). 
          Taux de résolution : <strong>${incidentResolutionRate}%</strong> | Taux de conformité : <strong>${auditConformityRate}%</strong>
          ${stats.incidents.nouveau > 0 ? ' | <strong style="color: #ef4444;">' + stats.incidents.nouveau + ' incidents en attente</strong>' : ''}
        </p>
      </div>
    </div>
  `;
};

const generateIncidentsReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const incidents = reportData.incidents;
  
  // Calculs détaillés
  const resolutionRate = stats.incidents.total > 0 
    ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1)
    : '0';
  const byType = incidents.reduce((acc: any, i: any) => {
    const type = i.type || 'Non spécifié';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const byPriority = incidents.reduce((acc: any, i: any) => {
    const priority = i.priorite || 'Non spécifié';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  const byService = incidents.reduce((acc: any, i: any) => {
    const service = i.service || 'Non spécifié';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée des Incidents
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #06b6d4;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #06b6d4;">${stats.incidents.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Nouveaux</div>
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.incidents.nouveau}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">En Cours</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.incidents.cours}</div>
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #10b981;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Traités</div>
          <div style="font-size: 28px; font-weight: bold; color: #10b981;">${stats.incidents.traite}</div>
        </div>
        <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e;">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Résolus</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${stats.incidents.resolu}</div>
        </div>
      </div>
      
      <!-- KPI et analyses -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Taux de Résolution</div>
            <div style="font-size: 32px; font-weight: bold; color: #06b6d4;">${resolutionRate}%</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 11px; color: #666; margin-bottom: 5px;">En Attente</div>
            <div style="font-size: 32px; font-weight: bold; color: #eab308;">${stats.incidents.nouveau}</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 11px; color: #666; margin-bottom: 5px;">En Traitement</div>
            <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${stats.incidents.cours}</div>
          </div>
        </div>
      </div>
      
      <!-- Répartitions -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4;">
          <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: bold;">Répartition par Type</h4>
          ${Object.entries(byType).slice(0, 5).map(([type, count]: [string, any]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px;">
              <span>${type}</span>
              <span style="font-weight: bold; color: #06b6d4;">${count}</span>
            </div>
          `).join('')}
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
          <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: bold;">Répartition par Priorité</h4>
          ${Object.entries(byPriority).map(([priority, count]: [string, any]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px;">
              <span>${priority}</span>
              <span style="font-weight: bold; color: #eab308;">${count}</span>
            </div>
          `).join('')}
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: bold;">Top 5 Services</h4>
          ${Object.entries(byService).sort(([,a]: any, [,b]: any) => b - a).slice(0, 5).map(([service, count]: [string, any]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px;">
              <span>${service}</span>
              <span style="font-weight: bold; color: #10b981;">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Section d'analyse approfondie
  html += `
    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Analyse Approfondie</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div style="background: white; padding: 15px; border-radius: 8px;">
          <h4 style="font-size: 13px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Tendances par Statut</h4>
          <div style="font-size: 11px; color: #475569; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Nouveaux incidents :</span>
              <strong style="color: #3b82f6;">${stats.incidents.nouveau} (${stats.incidents.total > 0 ? ((stats.incidents.nouveau / stats.incidents.total) * 100).toFixed(1) : 0}%)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>En cours de traitement :</span>
              <strong style="color: #eab308;">${stats.incidents.cours} (${stats.incidents.total > 0 ? ((stats.incidents.cours / stats.incidents.total) * 100).toFixed(1) : 0}%)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Résolus :</span>
              <strong style="color: #22c55e;">${stats.incidents.resolu} (${resolutionRate}%)</strong>
            </div>
          </div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px;">
          <h4 style="font-size: 13px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Recommandations</h4>
          <div style="font-size: 11px; color: #475569; line-height: 1.8;">
            ${stats.incidents.nouveau > 5 ? '<p style="margin: 5px 0; padding: 8px; background: #fef3c7; border-left: 3px solid #eab308; border-radius: 4px;">Attention : ' + stats.incidents.nouveau + ' incidents en attente nécessitent une action immédiate.</p>' : ''}
            ${parseFloat(resolutionRate) < 50 ? '<p style="margin: 5px 0; padding: 8px; background: #fee2e2; border-left: 3px solid #ef4444; border-radius: 4px;">Le taux de résolution est inférieur à 50%. Amélioration requise.</p>' : ''}
            ${parseFloat(resolutionRate) >= 80 ? '<p style="margin: 5px 0; padding: 8px; background: #dcfce7; border-left: 3px solid #22c55e; border-radius: 4px;">Excellent taux de résolution. Maintenir ce niveau de performance.</p>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  if (incidents.length > 0) {
    html += generateIncidentsTable(incidents.slice(0, 100), 'Liste Complète des Incidents');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucun incident enregistré pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateAuditsReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const audits = reportData.audits;
  
  const conformityRate = stats.audits.conformityRate || '0';
  const totalFindings = audits.reduce((sum: number, a: any) => sum + ((a.conformities_count || 0) + (a.non_conformities_count || 0)), 0);
  const totalNonConformities = audits.reduce((sum: number, a: any) => sum + (a.non_conformities_count || 0), 0);
  const totalConformities = audits.reduce((sum: number, a: any) => sum + (a.conformities_count || 0), 0);
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée des Audits
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #10b981;">${stats.audits.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Planifiés</div>
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.audits.planifie}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">En Cours</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.audits.en_cours}</div>
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Terminés</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${stats.audits.termine}</div>
        </div>
      </div>
      
      <!-- Indicateurs de conformité -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Conformité</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Conformité</div>
            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${conformityRate}%</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Conformités</div>
            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${totalConformities}</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Non-Conformités</div>
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${totalNonConformities}</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Total Constats</div>
            <div style="font-size: 24px; font-weight: bold; color: #06b6d4;">${totalFindings}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (audits.length > 0) {
    html += generateAuditsTable(audits.slice(0, 50), 'Liste Complète des Audits');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucun audit enregistré pour la période sélectionnée.</p>
      </div>
    `;
  }


  return html;
};

const generateTrainingsReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const trainings = reportData.trainings;
  
  const totalParticipants = trainings.reduce((sum: number, t: any) => sum + (t.participants_count || 0), 0);
  const completionRate = stats.trainings.total > 0 
    ? ((stats.trainings.terminee / stats.trainings.total) * 100).toFixed(1)
    : '0';
  const byCategory = trainings.reduce((acc: any, t: any) => {
    const category = t.category || 'Non spécifié';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée des Formations
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">${stats.trainings.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #7c3aed; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Planifiées</div>
          <div style="font-size: 28px; font-weight: bold; color: #7c3aed;">${stats.trainings.planifiee}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">En Cours</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.trainings.en_cours}</div>
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Terminées</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${stats.trainings.terminee}</div>
        </div>
      </div>
      
      <!-- Indicateurs de performance -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Complétion</div>
            <div style="font-size: 32px; font-weight: bold; color: #8b5cf6;">${completionRate}%</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Total Participants</div>
            <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${totalParticipants}</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Moyenne par Formation</div>
            <div style="font-size: 32px; font-weight: bold; color: #a855f7;">${stats.trainings.total > 0 ? (totalParticipants / stats.trainings.total).toFixed(1) : 0}</div>
          </div>
        </div>
      </div>
      
      <!-- Répartition par catégorie -->
      <div style="background: #faf5ff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #8b5cf6;">
        <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Répartition par Catégorie</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${Object.entries(byCategory).slice(0, 6).map(([category, count]: [string, any]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px; font-size: 11px;">
              <span>${category}</span>
              <strong style="color: #8b5cf6;">${count}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  if (trainings.length > 0) {
    html += generateTrainingsTable(trainings.slice(0, 50), 'Liste Complète des Formations');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucune formation enregistrée pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateMedicalWasteReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const waste = reportData.medicalWaste;
  
  const totalQuantity = waste.reduce((sum: number, w: any) => sum + (parseFloat(w.quantity) || 0), 0);
  const treatmentRate = stats.medicalWaste.total > 0
    ? ((stats.medicalWaste.traite / stats.medicalWaste.total) * 100).toFixed(1)
    : '0';
  const byType = waste.reduce((acc: any, w: any) => {
    const type = w.waste_type || 'Non spécifié';
    acc[type] = (acc[type] || 0) + (parseFloat(w.quantity) || 0);
    return acc;
  }, {});
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée des Déchets Médicaux
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #f97316;">${stats.medicalWaste.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Collectés</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.medicalWaste.collecte}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #facc15; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Stockés</div>
          <div style="font-size: 28px; font-weight: bold; color: #facc15;">${stats.medicalWaste.stocke}</div>
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Traités</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${stats.medicalWaste.traite}</div>
        </div>
      </div>
      
      <!-- Indicateurs de performance -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Traitement</div>
            <div style="font-size: 32px; font-weight: bold; color: #f97316;">${treatmentRate}%</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Quantité Totale</div>
            <div style="font-size: 32px; font-weight: bold; color: #eab308;">${totalQuantity.toFixed(2)}</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Unités</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Éliminés</div>
            <div style="font-size: 32px; font-weight: bold; color: #22c55e;">${stats.medicalWaste.elimine}</div>
          </div>
        </div>
      </div>
      
      <!-- Répartition par type -->
      ${Object.keys(byType).length > 0 ? `
        <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f97316;">
          <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Répartition par Type de Déchet</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${Object.entries(byType).sort(([,a]: any, [,b]: any) => b - a).slice(0, 6).map(([type, quantity]: [string, any]) => `
              <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px; font-size: 11px;">
                <span>${type}</span>
                <strong style="color: #f97316;">${Number(quantity).toFixed(2)}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if (waste.length > 0) {
    html += generateMedicalWasteTable(waste.slice(0, 50), 'Liste Complète des Déchets Médicaux');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucun déchet médical enregistré pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateRisksReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const risks = reportData.risks;
  
  const treatmentRate = stats.risks.total > 0
    ? ((stats.risks.traite / stats.risks.total) * 100).toFixed(1)
    : '0';
  const highRiskCount = Object.entries(stats.risks.byLevel || {}).reduce((sum, [level, count]: [string, any]) => {
    if (level === 'élevé' || level === 'très_élevé') {
      return sum + count;
    }
    return sum;
  }, 0);
  const byCategory = risks.reduce((acc: any, r: any) => {
    const category = r.risk_category || 'Non spécifié';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée des Risques
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #ef4444;">${stats.risks.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Identifiés</div>
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.risks.identifie}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Évalués</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.risks.evalue}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">En Traitement</div>
          <div style="font-size: 28px; font-weight: bold; color: #f97316;">${stats.risks.en_traitement}</div>
        </div>
        <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Traités</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${stats.risks.traite}</div>
        </div>
      </div>
      
      <!-- Indicateurs de performance -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Traitement</div>
            <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${treatmentRate}%</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Risques Élevés</div>
            <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${highRiskCount}</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">En Évaluation</div>
            <div style="font-size: 32px; font-weight: bold; color: #eab308;">${stats.risks.evalue}</div>
          </div>
        </div>
      </div>
      
      <!-- Répartition par catégorie -->
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
        <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Répartition par Catégorie</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${Object.entries(byCategory).sort(([,a]: any, [,b]: any) => b - a).slice(0, 6).map(([category, count]: [string, any]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px; font-size: 11px;">
              <span>${category}</span>
              <strong style="color: #ef4444;">${count}</strong>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${highRiskCount > 0 ? `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
          <h4 style="font-size: 14px; color: #991b1b; margin-bottom: 8px; font-weight: bold;">Alerte : Risques Prioritaires</h4>
          <p style="font-size: 12px; color: #7f1d1d; margin: 0; line-height: 1.6;">
            <strong>${highRiskCount}</strong> risque${highRiskCount > 1 ? 's' : ''} de niveau élevé ou très élevé ${highRiskCount > 1 ? 'ont été' : 'a été'} identifié${highRiskCount > 1 ? 's' : ''} 
            et nécessite${highRiskCount > 1 ? 'nt' : ''} une attention immédiate et un plan d'action prioritaire.
          </p>
        </div>
      ` : ''}
    </div>
  `;

  if (risks.length > 0) {
    html += generateRisksTable(risks.slice(0, 50), 'Liste Complète des Risques');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucun risque enregistré pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateSterilizationReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const cycles = reportData.sterilizationCycles;
  const register = reportData.sterilizationRegister;
  
  const successRate = stats.sterilization.successRate || '0';
  const conformCycles = cycles.filter((c: any) => c.result === 'conforme').length;
  const nonConformCycles = cycles.filter((c: any) => c.result === 'non_conforme').length;
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée de la Stérilisation
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #06b6d4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Cycles</div>
          <div style="font-size: 28px; font-weight: bold; color: #06b6d4;">${stats.sterilization.cycles}</div>
        </div>
        <div style="background: linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #0891b2; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Registres</div>
          <div style="font-size: 28px; font-weight: bold; color: #0891b2;">${stats.sterilization.register}</div>
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Conformes</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${conformCycles}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Non Conformes</div>
          <div style="font-size: 28px; font-weight: bold; color: #ef4444;">${nonConformCycles}</div>
        </div>
      </div>
      
      <!-- Indicateurs de performance -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Indicateurs de Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Taux de Réussite</div>
            <div style="font-size: 48px; font-weight: bold; color: #06b6d4;">${successRate}%</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Cycles conformes</div>
          </div>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">Total Activités</div>
            <div style="font-size: 48px; font-weight: bold; color: #0891b2;">${stats.sterilization.cycles + stats.sterilization.register}</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Cycles + Registres</div>
          </div>
        </div>
        ${parseFloat(successRate) < 95 ? `
          <div style="margin-top: 15px; padding: 12px; background: #fef3c7; border-left: 4px solid #eab308; border-radius: 4px;">
            <p style="font-size: 12px; color: #92400e; margin: 0; line-height: 1.6;">
              <strong>Attention :</strong> Le taux de réussite (${successRate}%) est inférieur à l'objectif de 95%. 
              Une analyse des causes des non-conformités est recommandée.
            </p>
          </div>
        ` : `
          <div style="margin-top: 15px; padding: 12px; background: #dcfce7; border-left: 4px solid #22c55e; border-radius: 4px;">
            <p style="font-size: 12px; color: #166534; margin: 0; line-height: 1.6;">
              <strong>Excellent :</strong> Le taux de réussite (${successRate}%) dépasse l'objectif de 95%. 
              Maintenir ce niveau de performance.
            </p>
          </div>
        `}
      </div>
    </div>
  `;

  if (cycles.length > 0) {
    html += generateSterilizationCyclesTable(cycles.slice(0, 50), 'Liste Complète des Cycles de Stérilisation');
  }

  if (register.length > 0) {
    html += generateSterilizationRegisterTable(register.slice(0, 50), 'Liste Complète du Registre de Stérilisation');
  }

  if (cycles.length === 0 && register.length === 0) {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucune activité de stérilisation enregistrée pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateLaundryReport = (data: QHSEReportData): string => {
  const { data: reportData, stats } = data;
  const laundry = reportData.laundryTracking;
  
  const totalWeight = laundry.reduce((sum: number, l: any) => sum + (parseFloat(l.poids_kg) || 0), 0);
  const totalQuantity = laundry.reduce((sum: number, l: any) => sum + (parseInt(l.quantite) || 0), 0);
  const byStatus = laundry.reduce((acc: any, l: any) => {
    const status = l.status || 'Non spécifié';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  let html = `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Analyse Détaillée du Suivi de Linge
      </h2>
      
      <!-- Statistiques principales -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #64748b; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Total Suivis</div>
          <div style="font-size: 28px; font-weight: bold; color: #64748b;">${stats.laundry.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Poids Total</div>
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${totalWeight.toFixed(2)}</div>
          <div style="font-size: 9px; color: #666; margin-top: 3px;">kg</div>
        </div>
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Quantité Totale</div>
          <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${totalQuantity}</div>
          <div style="font-size: 9px; color: #666; margin-top: 3px;">unités</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Moyenne</div>
          <div style="font-size: 28px; font-weight: bold; color: #eab308;">${stats.laundry.total > 0 ? (totalWeight / stats.laundry.total).toFixed(2) : 0}</div>
          <div style="font-size: 9px; color: #666; margin-top: 3px;">kg/suivi</div>
        </div>
      </div>
      
      <!-- Répartition par statut -->
      ${Object.keys(byStatus).length > 0 ? `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #64748b;">
          <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 10px; font-weight: 600;">Répartition par Statut</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            ${Object.entries(byStatus).map(([status, count]: [string, any]) => `
              <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px; font-size: 11px;">
                <span>${status}</span>
                <strong style="color: #64748b;">${count}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if (laundry.length > 0) {
    html += generateLaundryTable(laundry.slice(0, 50), 'Liste Complète des Suivis de Linge');
  } else {
    html += `
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 25px; border: 2px dashed #cbd5e1;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">Aucun suivi de linge enregistré pour la période sélectionnée.</p>
      </div>
    `;
  }

  return html;
};

const generateComprehensiveReport = (data: QHSEReportData): string => {
  let html = generateOverviewReport(data);
  html += generateIncidentsReport(data);
  html += generateAuditsReport(data);
  html += generateTrainingsReport(data);
  html += generateMedicalWasteReport(data);
  html += generateRisksReport(data);
  html += generateSterilizationReport(data);
  html += generateLaundryReport(data);
  
  // Section de conclusion et recommandations
  const { stats } = data;
  const overallPerformance = (
    (parseFloat(stats.incidents.total > 0 ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1) : '0')) +
    parseFloat(stats.audits.conformityRate || '0') +
    parseFloat(stats.risks.total > 0 ? ((stats.risks.traite / stats.risks.total) * 100).toFixed(1) : '0') +
    parseFloat(stats.sterilization.successRate || '0')
  ) / 4;
  
  html += `
    <div style="margin-top: 40px; margin-bottom: 30px; page-break-inside: avoid;">
      <h2 style="font-size: 22px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold;">
        Conclusion et Recommandations
      </h2>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #06b6d4;">
        <h3 style="font-size: 18px; color: #1e293b; margin-bottom: 15px; font-weight: bold;">Performance Globale</h3>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: bold; color: #06b6d4; margin-bottom: 5px;">${overallPerformance.toFixed(1)}%</div>
          <div style="font-size: 14px; color: #64748b;">Score de performance QHSE global</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 25px;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Points Forts</h4>
            <ul style="font-size: 12px; color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
              ${parseFloat(stats.incidents.total > 0 ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1) : '0') >= 70 ? '<li>Taux de résolution des incidents satisfaisant</li>' : ''}
              ${parseFloat(stats.audits.conformityRate || '0') >= 80 ? '<li>Excellent taux de conformité des audits</li>' : ''}
              ${stats.trainings.total > 0 ? '<li>Programme de formations actif et suivi</li>' : ''}
              ${parseFloat(stats.sterilization.successRate || '0') >= 95 ? '<li>Performance de stérilisation excellente</li>' : ''}
              ${stats.risks.traite > 0 ? '<li>Risques identifiés traités efficacement</li>' : ''}
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Recommandations</h4>
            <ul style="font-size: 12px; color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
              ${stats.incidents.nouveau > 5 ? '<li>Réduire le nombre d\'incidents en attente (' + stats.incidents.nouveau + ' actuellement)</li>' : ''}
              ${parseFloat(stats.incidents.total > 0 ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1) : '0') < 50 ? '<li>Améliorer le taux de résolution des incidents</li>' : ''}
              ${Object.entries(stats.risks.byLevel || {}).reduce((sum, [level, count]: [string, any]) => {
                if (level === 'élevé' || level === 'très_élevé') return sum + count;
                return sum;
              }, 0) > 5 ? '<li>Prioriser le traitement des risques élevés</li>' : ''}
              ${stats.trainings.planifiee > stats.trainings.terminee ? '<li>Finaliser les formations planifiées en attente</li>' : ''}
              <li>Maintenir la veille continue sur les indicateurs QHSE</li>
              <li>Renforcer les actions préventives basées sur l'analyse des tendances</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 25px;">
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 12px; font-weight: bold;">Synthèse des Actions Prioritaires</h3>
        <div style="font-size: 12px; color: #475569; line-height: 1.8;">
          <p style="margin-bottom: 10px;">
            <strong>1. Gestion des Incidents :</strong> ${stats.incidents.nouveau > 0 
              ? 'Traiter en priorité les ' + stats.incidents.nouveau + ' incident' + (stats.incidents.nouveau > 1 ? 's' : '') + ' en attente.'
              : 'Aucun incident en attente. Maintenir ce niveau.'}
          </p>
          <p style="margin-bottom: 10px;">
            <strong>2. Conformité des Audits :</strong> ${parseFloat(stats.audits.conformityRate || '0') >= 80 
              ? 'Taux de conformité excellent. Continuer les efforts de conformité.'
              : 'Renforcer les actions correctives pour améliorer le taux de conformité.'}
          </p>
          <p style="margin-bottom: 10px;">
            <strong>3. Gestion des Risques :</strong> ${Object.entries(stats.risks.byLevel || {}).reduce((sum, [level, count]: [string, any]) => {
              if (level === 'élevé' || level === 'très_élevé') return sum + count;
              return sum;
            }, 0) > 0 
              ? 'Traiter en urgence les risques de niveau élevé identifiés.'
              : 'Aucun risque élevé identifié. Maintenir la veille.'}
          </p>
          <p>
            <strong>4. Formations :</strong> ${stats.trainings.planifiee > 0 
              ? 'Finaliser les ' + stats.trainings.planifiee + ' formation' + (stats.trainings.planifiee > 1 ? 's' : '') + ' planifiée' + (stats.trainings.planifiee > 1 ? 's' : '') + '.'
              : 'Aucune formation planifiée. Évaluer les besoins de formation.'}
          </p>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px; border-top: 3px solid #06b6d4;">
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0; line-height: 1.6;">
          <strong>Centre Diagnostic Libreville</strong><br/>
          Rapport QHSE généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}<br/>
          Ce document est confidentiel et destiné à un usage interne uniquement.
        </p>
      </div>
    </div>
  `;
  
  return html;
};

// Fonctions de génération de tableaux
const generateIncidentsTable = (incidents: any[], title: string): string => {
  if (incidents.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 8px; font-weight: bold;">
        ${title} (${incidents.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Date/Heure</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Type</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Lieu</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Service</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Priorité</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Assigné à</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map((incident: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${format(new Date(incident.date_creation), 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${incident.type || 'Non spécifié'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${incident.lieu || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${incident.service || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getPriorityColor(incident.priorite)}; color: white; font-weight: bold;">
                  ${incident.priorite || 'Non spécifié'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getStatusColor(incident.statut)}; color: white; font-weight: bold;">
                  ${incident.statut || 'Non spécifié'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${incident.assigned_to_name || incident.assigned_to || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; max-width: 250px; word-wrap: break-word; font-size: 9px;">${(incident.description || 'Aucune description').substring(0, 150)}${incident.description && incident.description.length > 150 ? '...' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateAuditsTable = (audits: any[], title: string): string => {
  if (audits.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 8px; font-weight: bold;">
        ${title} (${audits.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Titre</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Type</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Date Planifiée</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Date Réelle</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Conformités</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Non-Conformités</th>
            <th style="padding: 12px; border: 1px solid #059669; text-align: left; font-weight: bold;">Scope</th>
          </tr>
        </thead>
        <tbody>
          ${audits.map((audit: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${audit.title || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${audit.audit_type || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${audit.planned_date ? format(new Date(audit.planned_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${audit.actual_date ? format(new Date(audit.actual_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getAuditStatusColor(audit.status)}; color: white; font-weight: bold;">
                  ${audit.status || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #22c55e; font-weight: bold;">${audit.conformities_count || 0}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #ef4444; font-weight: bold;">${audit.non_conformities_count || 0}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; max-width: 200px; word-wrap: break-word; font-size: 9px;">${(audit.scope || 'Non spécifié').substring(0, 150)}${audit.scope && audit.scope.length > 150 ? '...' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateTrainingsTable = (trainings: any[], title: string): string => {
  if (trainings.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; font-weight: bold;">
        ${title} (${trainings.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Titre</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Catégorie</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Type</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Date Planifiée</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Date Réelle</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Participants</th>
            <th style="padding: 12px; border: 1px solid #7c3aed; text-align: left; font-weight: bold;">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${trainings.map((training: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${training.title || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${training.category || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${training.training_type || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${training.planned_date ? format(new Date(training.planned_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${training.actual_date ? format(new Date(training.actual_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #8b5cf6;">${training.participants_count || 0}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getTrainingStatusColor(training.status)}; color: white; font-weight: bold;">
                  ${training.status || '-'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateMedicalWasteTable = (waste: any[], title: string): string => {
  if (waste.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #f97316; padding-bottom: 8px; font-weight: bold;">
        ${title} (${waste.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Type</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Quantité</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Unité</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Date Collecte</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Lieu</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #ea580c; text-align: left; font-weight: bold;">Date Traitement</th>
          </tr>
        </thead>
        <tbody>
          ${waste.map((item: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${item.waste_type || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${item.quantity || '0'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.unit || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.collection_date ? format(new Date(item.collection_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.collection_location || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getWasteStatusColor(item.status)}; color: white; font-weight: bold;">
                  ${item.status || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.treatment_date ? format(new Date(item.treatment_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateRisksTable = (risks: any[], title: string): string => {
  if (risks.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #ef4444; padding-bottom: 8px; font-weight: bold;">
        ${title} (${risks.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Titre</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Catégorie</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Niveau</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Probabilité</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Sévérité</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #dc2626; text-align: left; font-weight: bold;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map((risk: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${risk.title || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${risk.risk_category || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getRiskLevelColor(risk.risk_level)}; color: white; font-weight: bold;">
                  ${risk.risk_level || 'Non spécifié'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${risk.probability || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${risk.severity || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getRiskStatusColor(risk.status)}; color: white; font-weight: bold;">
                  ${risk.status || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; max-width: 200px; word-wrap: break-word; font-size: 9px;">${(risk.description || 'Aucune description').substring(0, 150)}${risk.description && risk.description.length > 150 ? '...' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateSterilizationCyclesTable = (cycles: any[], title: string): string => {
  if (cycles.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 8px; font-weight: bold;">
        ${title} (${cycles.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">N° Cycle</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Stérilisateur</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Type</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Programme</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Début</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Fin</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Température</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #0891b2; text-align: left; font-weight: bold;">Résultat</th>
          </tr>
        </thead>
        <tbody>
          ${cycles.map((cycle: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 500;">${cycle.cycle_number || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${cycle.sterilizer_id || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${cycle.sterilizer_type || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${cycle.program_name || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${cycle.start_time ? format(new Date(cycle.start_time), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${cycle.end_time ? format(new Date(cycle.end_time), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${cycle.temperature ? cycle.temperature + '°C' : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getCycleStatusColor(cycle.status)}; color: white; font-weight: bold;">
                  ${cycle.status || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getCycleResultColor(cycle.result)}; color: white; font-weight: bold;">
                  ${cycle.result || '-'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateSterilizationRegisterTable = (registers: any[], title: string): string => {
  if (registers.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #0891b2; padding-bottom: 8px; font-weight: bold;">
        ${title} (${registers.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Date Cycle</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Service</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Opérateur</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Type Matériel</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Méthode</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">N° Lot</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #0e7490; text-align: left; font-weight: bold;">Date Libération</th>
          </tr>
        </thead>
        <tbody>
          ${registers.map((register: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.date_cycle ? format(new Date(register.date_cycle), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.service_concerne || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.operateur_nom || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.type_materiel || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.methode_sterilisation || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.numero_lot_charge || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getCycleStatusColor(register.status_cycle)}; color: white; font-weight: bold;">
                  ${register.status_cycle || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${register.date_liberation ? format(new Date(register.date_liberation), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateLaundryTable = (laundry: any[], title: string): string => {
  if (laundry.length === 0) return '';

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #64748b; padding-bottom: 8px; font-weight: bold;">
        ${title} (${laundry.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #d1d5db;">
        <thead>
          <tr style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white;">
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Date Réception</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Service Origine</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Type Linge</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Poids (kg)</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Quantité</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Statut</th>
            <th style="padding: 12px; border: 1px solid #475569; text-align: left; font-weight: bold;">Date Distribution</th>
          </tr>
        </thead>
        <tbody>
          ${laundry.map((item: any, index: number) => `
            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.date_reception ? format(new Date(item.date_reception), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.service_origine || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.type_linge || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${item.poids_kg ? parseFloat(item.poids_kg).toFixed(2) : '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${item.quantite || '-'}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 9px; background: ${getLaundryStatusColor(item.status)}; color: white; font-weight: bold;">
                  ${item.status || '-'}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.date_distribution ? format(new Date(item.date_distribution), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

// Fonctions utilitaires de couleurs
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    critique: '#dc2626',
    haute: '#f97316',
    moyenne: '#eab308',
    faible: '#22c55e',
  };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    nouveau: '#3b82f6',
    cours: '#eab308',
    traite: '#14b8a6',
    resolu: '#22c55e',
    attente: '#f97316',
  };
  return colors[status] || '#6b7280';
};

const getAuditStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    planifié: '#3b82f6',
    en_cours: '#eab308',
    terminé: '#22c55e',
    annulé: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

const getTrainingStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    planifiée: '#3b82f6',
    en_cours: '#eab308',
    terminée: '#22c55e',
    annulée: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

const getWasteStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    collecté: '#3b82f6',
    stocké: '#eab308',
    traité: '#14b8a6',
    éliminé: '#22c55e',
  };
  return colors[status] || '#6b7280';
};

const getRiskLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    très_faible: '#22c55e',
    faible: '#3b82f6',
    moyen: '#eab308',
    élevé: '#f97316',
    très_élevé: '#dc2626',
  };
  return colors[level] || '#6b7280';
};

const getRiskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    identifié: '#3b82f6',
    évalué: '#eab308',
    en_traitement: '#f97316',
    traité: '#22c55e',
    surveillé: '#06b6d4',
  };
  return colors[status] || '#6b7280';
};

const getCycleStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    en_cours: '#eab308',
    terminé: '#22c55e',
    échoué: '#dc2626',
    annulé: '#6b7280',
    interrompu: '#f97316',
  };
  return colors[status] || '#6b7280';
};

const getCycleResultColor = (result: string): string => {
  const colors: Record<string, string> = {
    conforme: '#22c55e',
    non_conforme: '#dc2626',
    en_attente: '#eab308',
  };
  return colors[result] || '#6b7280';
};

const getLaundryStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    en_reception: '#3b82f6',
    en_lavage: '#06b6d4',
    en_sechage: '#eab308',
    en_pliage: '#14b8a6',
    en_stockage: '#6b7280',
    en_distribution: '#22c55e',
    termine: '#22c55e',
    non_conforme: '#dc2626',
  };
  return colors[status] || '#6b7280';
};

// Fonction pour charger une image
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const generateQHSEReportPDF = async (
  reportType: ReportType,
  data: QHSEReportData
): Promise<void> => {
  const reportElement = createReportHTML(reportType, data);

  try {
    // Attendre que les images soient chargées
    const images = reportElement.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    }));

    const canvas = await html2canvas(reportElement, { 
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = pdfHeight - 20; // Marge de 10mm en haut et en bas

    // Ajouter la première page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Ajouter des pages supplémentaires si nécessaire
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `rapport-qhse-${reportType}-${format(new Date(), 'yyyy-MM-dd-HHmm', { locale: fr })}.pdf`;
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



