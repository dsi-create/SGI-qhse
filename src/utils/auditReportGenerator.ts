import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Audit, User, Users } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LOGO_URL = 'https://page1.genspark.site/v1/base64_upload/85255e9e3f43d5940a170bdbd6d7b858';

interface Finding {
  id: string;
  type: 'conformité' | 'non_conformité' | 'opportunité';
  description: string;
  severity?: 'mineure' | 'majeure' | 'critique';
  action_plan?: string;
}

const auditTypeLabels: Record<string, string> = {
  interne: "Audit Interne",
  externe: "Audit Externe",
  certification: "Audit Certification",
  inspection: "Inspection",
};

const statusLabels: Record<string, string> = {
  planifié: "Planifié",
  en_cours: "En cours",
  terminé: "Terminé",
  annulé: "Annulé",
};

const severityLabels: Record<string, string> = {
  mineure: "Mineure",
  majeure: "Majeure",
  critique: "Critique",
};

const createReportHTML = (audit: Audit, users?: Users): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#333';
  container.style.backgroundColor = '#ffffff';

  // Parser les findings
  let findings: Finding[] = [];
  if (audit.findings) {
    try {
      const parsed = typeof audit.findings === 'string' 
        ? JSON.parse(audit.findings) 
        : audit.findings;
      if (Array.isArray(parsed)) {
        findings = parsed;
      }
    } catch (e) {
      console.error('Erreur lors du parsing des findings:', e);
    }
  }

  const createdByUser = users ? Object.values(users).find(u => u.id === audit.created_by) : null;
  const auditorUser = audit.auditor_id && users ? Object.values(users).find(u => u.id === audit.auditor_id) : null;

  const today = new Date();
  let html = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #06b6d4; padding-bottom: 20px;">
      <img src="${LOGO_URL}" alt="Logo CDL" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
      <h1 style="font-size: 28px; margin: 10px 0; color: #06b6d4; font-weight: bold;">
        RAPPORT D'AUDIT
      </h1>
      <p style="font-size: 12px; margin: 5px 0; color: #666;">
        Centre Diagnostic Libreville
      </p>
      <p style="font-size: 11px; margin: 5px 0; color: #999;">
        Rapport généré le ${format(today, 'dd MMMM yyyy à HH:mm', { locale: fr })}
      </p>
    </div>

    <!-- Informations générales de l'audit -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
        1. INFORMATIONS GÉNÉRALES
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 35%;">Titre de l'audit</td>
          <td style="padding: 8px; border: 1px solid #ddd; width: 65%;">${audit.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Type d'audit</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${auditTypeLabels[audit.audit_type] || audit.audit_type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Date planifiée</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${format(audit.planned_date, 'dd MMMM yyyy', { locale: fr })}</td>
        </tr>
        ${audit.actual_date ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Date réelle</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${format(new Date(audit.actual_date), 'dd MMMM yyyy', { locale: fr })}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Statut</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
              audit.status === 'terminé' ? '#10b981' : 
              audit.status === 'en_cours' ? '#f59e0b' : 
              audit.status === 'annulé' ? '#ef4444' : '#3b82f6'
            }; color: white; font-size: 12px;">
              ${statusLabels[audit.status] || audit.status}
            </span>
          </td>
        </tr>
        ${audit.audited_department ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Département audité</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${audit.audited_department}</td>
        </tr>
        ` : ''}
        ${createdByUser ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Créé par</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${createdByUser.civility} ${createdByUser.first_name} ${createdByUser.last_name}</td>
        </tr>
        ` : ''}
        ${auditorUser ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Auditeur</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${auditorUser.civility} ${auditorUser.first_name} ${auditorUser.last_name}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Périmètre -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
        2. PÉRIMÈTRE DE L'AUDIT
      </h2>
      <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #06b6d4; border-radius: 4px;">
        <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${audit.scope}</p>
      </div>
    </div>

    <!-- Statistiques -->
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
        3. RÉSUMÉ DES CONSTATS
      </h2>
      <div style="display: flex; gap: 15px; margin-bottom: 20px;">
        <div style="flex: 1; padding: 15px; background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 5px;">
            ${findings.filter(f => f.type === 'non_conformité').length}
          </div>
          <div style="font-size: 14px; color: #991b1b; font-weight: bold;">Non-conformités</div>
        </div>
        <div style="flex: 1; padding: 15px; background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #16a34a; margin-bottom: 5px;">
            ${findings.filter(f => f.type === 'conformité').length}
          </div>
          <div style="font-size: 14px; color: #166534; font-weight: bold;">Conformités</div>
        </div>
        <div style="flex: 1; padding: 15px; background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 5px;">
            ${findings.filter(f => f.type === 'opportunité').length}
          </div>
          <div style="font-size: 14px; color: #1e40af; font-weight: bold;">Opportunités</div>
        </div>
      </div>
    </div>
  `;

  // Constats détaillés
  if (findings.length > 0) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
          4. CONSTATS DÉTAILLÉS
        </h2>
    `;

    // Non-conformités
    const nonConformities = findings.filter(f => f.type === 'non_conformité');
    if (nonConformities.length > 0) {
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: #dc2626; margin-bottom: 10px; font-weight: bold;">
            ❌ NON-CONFORMITÉS (${nonConformities.length})
          </h3>
      `;
      nonConformities.forEach((finding, index) => {
        html += `
          <div style="margin-bottom: 15px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
            <div style="font-weight: bold; color: #991b1b; margin-bottom: 8px;">
              Non-conformité #${index + 1}
              ${finding.severity ? ` - Sévérité: ${severityLabels[finding.severity] || finding.severity}` : ''}
            </div>
            <div style="margin-bottom: 8px; line-height: 1.6;">
              <strong>Description:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.description}</span>
            </div>
            ${finding.action_plan ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #fecaca;">
              <strong>Plan d'action:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.action_plan}</span>
            </div>
            ` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    // Conformités
    const conformities = findings.filter(f => f.type === 'conformité');
    if (conformities.length > 0) {
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: #16a34a; margin-bottom: 10px; font-weight: bold;">
            ✅ CONFORMITÉS (${conformities.length})
          </h3>
      `;
      conformities.forEach((finding, index) => {
        html += `
          <div style="margin-bottom: 15px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
            <div style="font-weight: bold; color: #166534; margin-bottom: 8px;">
              Conformité #${index + 1}
            </div>
            <div style="margin-bottom: 8px; line-height: 1.6;">
              <strong>Description:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.description}</span>
            </div>
            ${finding.action_plan ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #bbf7d0;">
              <strong>Plan d'action:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.action_plan}</span>
            </div>
            ` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    // Opportunités
    const opportunities = findings.filter(f => f.type === 'opportunité');
    if (opportunities.length > 0) {
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: #2563eb; margin-bottom: 10px; font-weight: bold;">
            💡 OPPORTUNITÉS D'AMÉLIORATION (${opportunities.length})
          </h3>
      `;
      opportunities.forEach((finding, index) => {
        html += `
          <div style="margin-bottom: 15px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px;">
              Opportunité #${index + 1}
            </div>
            <div style="margin-bottom: 8px; line-height: 1.6;">
              <strong>Description:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.description}</span>
            </div>
            ${finding.action_plan ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #bfdbfe;">
              <strong>Plan d'action:</strong><br/>
              <span style="white-space: pre-wrap;">${finding.action_plan}</span>
            </div>
            ` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  } else {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
          4. CONSTATS DÉTAILLÉS
        </h2>
        <div style="padding: 20px; text-align: center; color: #666; background-color: #f8f9fa; border-radius: 4px;">
          Aucun constat enregistré pour cet audit.
        </div>
      </div>
    `;
  }

  // Conclusion
  html += `
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 5px; margin-bottom: 15px;">
        5. CONCLUSION
      </h2>
      <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #06b6d4; border-radius: 4px;">
        <p style="margin: 0; line-height: 1.6;">
          Cet audit a permis d'identifier <strong>${findings.filter(f => f.type === 'non_conformité').length} non-conformité(s)</strong>, 
          <strong>${findings.filter(f => f.type === 'conformité').length} conformité(s)</strong>, et 
          <strong>${findings.filter(f => f.type === 'opportunité').length} opportunité(s) d'amélioration</strong>.
        </p>
        ${findings.filter(f => f.type === 'non_conformité').length > 0 ? `
        <p style="margin: 10px 0 0 0; line-height: 1.6;">
          <strong>Actions requises:</strong> Les non-conformités identifiées nécessitent la mise en place de plans d'action correctifs 
          et préventifs pour assurer la conformité continue.
        </p>
        ` : ''}
      </div>
    </div>

    <!-- Pied de page -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 11px;">
      <p style="margin: 5px 0;">Centre Diagnostic Libreville</p>
      <p style="margin: 5px 0;">Rapport généré le ${format(today, 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
      <p style="margin: 5px 0;">Document confidentiel - Usage interne uniquement</p>
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

export const generateAuditReportPDF = async (audit: Audit, users?: Users) => {
  const reportElement = createReportHTML(audit, users);

  // Attendre que l'image du logo soit chargée
  await new Promise((resolve) => {
    const img = reportElement.querySelector('img');
    if (img) {
      if (img.complete) {
        resolve(undefined);
      } else {
        img.onload = () => resolve(undefined);
        img.onerror = () => resolve(undefined); // Continuer même si le logo ne charge pas
      }
    } else {
      resolve(undefined);
    }
  });

  const canvas = await html2canvas(reportElement, { 
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  // Si le contenu dépasse une page, ajouter des pages supplémentaires
  let heightLeft = pdfHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();
  
  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  const fileName = `rapport-audit-${audit.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);

  document.body.removeChild(reportElement);
};



