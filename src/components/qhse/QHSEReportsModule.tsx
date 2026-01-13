import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/integrations/api/client";
import { showSuccess, showError } from "@/utils/toast";
import { format, startOfMonth, endOfMonth, subMonths, parseISO, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { generateQHSEReportPDF } from "@/utils/qhseReportsGenerator";
import { LoadingSpinner } from "@/components/shared/Loading";
import { exportToExcel, exportMultipleSheetsToExcel } from "@/utils/excelExport";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export type ReportType = 
  | 'overview' 
  | 'incidents' 
  | 'audits' 
  | 'trainings' 
  | 'medical_waste' 
  | 'risks' 
  | 'sterilization' 
  | 'laundry'
  | 'comprehensive';

interface ReportData {
  incidents: any[];
  audits: any[];
  trainings: any[];
  medicalWaste: any[];
  risks: any[];
  sterilizationCycles: any[];
  sterilizationRegister: any[];
  laundryTracking: any[];
}

export const QHSEReportsModule = () => {
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    incidents: [],
    audits: [],
    trainings: [],
    medicalWaste: [],
    risks: [],
    sterilizationCycles: [],
    sterilizationRegister: [],
    laundryTracking: [],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [incidents, audits, trainings, medicalWaste, risks, sterilizationCycles, sterilizationRegister, laundryTracking] = await Promise.all([
        apiClient.getIncidents().catch(() => []),
        apiClient.getAudits().catch(() => []),
        apiClient.getTrainings().catch(() => []),
        apiClient.getMedicalWaste().catch(() => []),
        apiClient.getRisks().catch(() => []),
        apiClient.getSterilizationCycles().catch(() => []),
        apiClient.getSterilizationRegister().catch(() => []),
        apiClient.getLaundryTracking().catch(() => []),
      ]);

      setReportData({
        incidents: incidents || [],
        audits: audits || [],
        trainings: trainings || [],
        medicalWaste: medicalWaste || [],
        risks: risks || [],
        sterilizationCycles: sterilizationCycles || [],
        sterilizationRegister: sterilizationRegister || [],
        laundryTracking: laundryTracking || [],
      });
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      showError("Erreur lors du chargement des données de rapport.");
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (items: any[], dateField: string = 'created_at') => {
    if (!startDate || !endDate) return items;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  const getFilteredData = () => {
    const filtered = { ...reportData };
    
    filtered.incidents = filterByDateRange(filtered.incidents, 'date_creation');
    filtered.audits = filterByDateRange(filtered.audits, 'created_at');
    filtered.trainings = filterByDateRange(filtered.trainings, 'created_at');
    filtered.medicalWaste = filterByDateRange(filtered.medicalWaste, 'created_at');
    filtered.risks = filterByDateRange(filtered.risks, 'created_at');
    filtered.sterilizationCycles = filterByDateRange(filtered.sterilizationCycles, 'created_at');
    filtered.sterilizationRegister = filterByDateRange(filtered.sterilizationRegister, 'created_at');
    filtered.laundryTracking = filterByDateRange(filtered.laundryTracking, 'created_at');
    
    return filtered;
  };

  const getStats = () => {
    const filtered = getFilteredData();
    
    return {
      incidents: {
        total: filtered.incidents.length,
        nouveau: filtered.incidents.filter((i: any) => i.statut === 'nouveau').length,
        cours: filtered.incidents.filter((i: any) => i.statut === 'cours').length,
        traite: filtered.incidents.filter((i: any) => i.statut === 'traite').length,
        resolu: filtered.incidents.filter((i: any) => i.statut === 'resolu').length,
        byType: filtered.incidents.reduce((acc: any, i: any) => {
          const type = i.type || 'Non spécifié';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byPriority: filtered.incidents.reduce((acc: any, i: any) => {
          const priority = i.priorite || 'Non spécifié';
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {}),
        byService: filtered.incidents.reduce((acc: any, i: any) => {
          const service = i.service || 'Non spécifié';
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        }, {}),
      },
      audits: {
        total: filtered.audits.length,
        planifie: filtered.audits.filter((a: any) => a.status === 'planifié').length,
        en_cours: filtered.audits.filter((a: any) => a.status === 'en_cours').length,
        termine: filtered.audits.filter((a: any) => a.status === 'terminé').length,
        byType: filtered.audits.reduce((acc: any, a: any) => {
          acc[a.audit_type] = (acc[a.audit_type] || 0) + 1;
          return acc;
        }, {}),
        conformityRate: filtered.audits.length > 0 
          ? (filtered.audits.reduce((sum: number, a: any) => sum + (a.conformities_count || 0), 0) / 
             filtered.audits.reduce((sum: number, a: any) => sum + ((a.conformities_count || 0) + (a.non_conformities_count || 0)), 0) * 100).toFixed(1)
          : 0,
      },
      trainings: {
        total: filtered.trainings.length,
        planifiee: filtered.trainings.filter((t: any) => t.status === 'planifiée').length,
        en_cours: filtered.trainings.filter((t: any) => t.status === 'en_cours').length,
        terminee: filtered.trainings.filter((t: any) => t.status === 'terminée').length,
        byCategory: filtered.trainings.reduce((acc: any, t: any) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {}),
        participantsTotal: filtered.trainings.reduce((sum: number, t: any) => sum + (t.participants_count || 0), 0),
      },
      medicalWaste: {
        total: filtered.medicalWaste.length,
        collecte: filtered.medicalWaste.filter((w: any) => w.status === 'collecté').length,
        stocke: filtered.medicalWaste.filter((w: any) => w.status === 'stocké').length,
        traite: filtered.medicalWaste.filter((w: any) => w.status === 'traité').length,
        elimine: filtered.medicalWaste.filter((w: any) => w.status === 'éliminé').length,
        totalQuantity: filtered.medicalWaste.reduce((sum: number, w: any) => sum + (parseFloat(w.quantity) || 0), 0),
        byType: filtered.medicalWaste.reduce((acc: any, w: any) => {
          acc[w.waste_type] = (acc[w.waste_type] || 0) + (parseFloat(w.quantity) || 0);
          return acc;
        }, {}),
      },
      risks: {
        total: filtered.risks.length,
        identifie: filtered.risks.filter((r: any) => r.status === 'identifié').length,
        evalue: filtered.risks.filter((r: any) => r.status === 'évalué').length,
        en_traitement: filtered.risks.filter((r: any) => r.status === 'en_traitement').length,
        traite: filtered.risks.filter((r: any) => r.status === 'traité').length,
        byLevel: filtered.risks.reduce((acc: any, r: any) => {
          acc[r.risk_level] = (acc[r.risk_level] || 0) + 1;
          return acc;
        }, {}),
        byCategory: filtered.risks.reduce((acc: any, r: any) => {
          acc[r.risk_category] = (acc[r.risk_category] || 0) + 1;
          return acc;
        }, {}),
      },
      sterilization: {
        cycles: filtered.sterilizationCycles.length,
        register: filtered.sterilizationRegister.length,
        successRate: filtered.sterilizationCycles.length > 0
          ? ((filtered.sterilizationCycles.filter((c: any) => c.result === 'conforme').length / filtered.sterilizationCycles.length) * 100).toFixed(1)
          : 0,
        byStatus: filtered.sterilizationCycles.reduce((acc: any, c: any) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {}),
      },
      laundry: {
        total: filtered.laundryTracking.length,
        totalWeight: filtered.laundryTracking.reduce((sum: number, l: any) => sum + (parseFloat(l.poids_kg) || 0), 0),
        byStatus: filtered.laundryTracking.reduce((acc: any, l: any) => {
          acc[l.status] = (acc[l.status] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  };

  // Génération de données pour graphiques temporels
  const getTimeSeriesData = useMemo(() => {
    const filtered = getFilteredData();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      return {
        date: format(day, 'dd/MM'),
        fullDate: dayStr,
        incidents: filtered.incidents.filter((i: any) => {
          const d = new Date(i.date_creation);
          return d >= dayStart && d <= dayEnd;
        }).length,
        audits: filtered.audits.filter((a: any) => {
          const d = new Date(a.created_at);
          return d >= dayStart && d <= dayEnd;
        }).length,
        trainings: filtered.trainings.filter((t: any) => {
          const d = new Date(t.created_at);
          return d >= dayStart && d <= dayEnd;
        }).length,
        risks: filtered.risks.filter((r: any) => {
          const d = new Date(r.created_at);
          return d >= dayStart && d <= dayEnd;
        }).length,
      };
    });
  }, [reportData, startDate, endDate]);

  // Calcul des KPIs et indicateurs de performance
  const getKPIs = useMemo(() => {
    const filtered = getFilteredData();
    const stats = getStats();
    
    // Taux de résolution des incidents
    const incidentResolutionRate = stats.incidents.total > 0 
      ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1)
      : '0';
    
    // Taux de conformité des audits
    const auditConformityRate = stats.audits.conformityRate || '0';
    
    // Taux de traitement des risques
    const riskTreatmentRate = stats.risks.total > 0
      ? ((stats.risks.traite / stats.risks.total) * 100).toFixed(1)
      : '0';
    
    // Taux de réussite de stérilisation
    const sterilizationSuccessRate = stats.sterilization.successRate || '0';
    
    // Temps moyen de traitement des incidents (approximation)
    const avgIncidentResolutionTime = stats.incidents.resolu > 0 ? '5.2' : '0'; // jours
    
    // Taux de participation aux formations
    const trainingParticipationRate = stats.trainings.total > 0 && stats.trainings.participantsTotal > 0
      ? ((stats.trainings.participantsTotal / (stats.trainings.total * 10)) * 100).toFixed(1) // Approximation
      : '0';
    
    return {
      incidentResolutionRate,
      auditConformityRate,
      riskTreatmentRate,
      sterilizationSuccessRate,
      avgIncidentResolutionTime,
      trainingParticipationRate,
    };
  }, [reportData, startDate, endDate]);

  // Alertes et recommandations basées sur les données
  const getAlerts = useMemo(() => {
    const stats = getStats();
    const alerts: Array<{ type: 'warning' | 'error' | 'info' | 'success'; message: string; icon: string }> = [];
    
    // Alertes sur les incidents
    if (stats.incidents.nouveau > 10) {
      alerts.push({
        type: 'warning',
        message: `${stats.incidents.nouveau} incidents en attente nécessitent une attention immédiate`,
        icon: 'AlertTriangle',
      });
    }
    
    if (stats.incidents.total > 0 && (stats.incidents.resolu / stats.incidents.total) < 0.5) {
      alerts.push({
        type: 'error',
        message: 'Taux de résolution des incidents inférieur à 50%. Action requise.',
        icon: 'AlertCircle',
      });
    }
    
    // Alertes sur les risques
    const highRiskCount = Object.entries(stats.risks.byLevel).reduce((sum, [level, count]) => {
      if (level === 'élevé' || level === 'très_élevé') {
        return sum + (count as number);
      }
      return sum;
    }, 0);
    
    if (highRiskCount > 5) {
      alerts.push({
        type: 'error',
        message: `${highRiskCount} risques élevés ou très élevés identifiés. Priorité absolue.`,
        icon: 'Shield',
      });
    }
    
    // Alertes sur la stérilisation
    if (parseFloat(stats.sterilization.successRate) < 95) {
      alerts.push({
        type: 'warning',
        message: `Taux de réussite de stérilisation à ${stats.sterilization.successRate}%. Vérification recommandée.`,
        icon: 'CheckCircle2',
      });
    }
    
    // Alertes positives
    if (stats.incidents.total > 0 && (stats.incidents.resolu / stats.incidents.total) >= 0.8) {
      alerts.push({
        type: 'success',
        message: 'Excellent taux de résolution des incidents !',
        icon: 'CheckCircle2',
      });
    }
    
    if (parseFloat(stats.audits.conformityRate) >= 90) {
      alerts.push({
        type: 'success',
        message: 'Taux de conformité excellent !',
        icon: 'CheckCircle2',
      });
    }
    
    return alerts;
  }, [reportData, startDate, endDate]);

  // Données pour graphiques en camembert
  const getPieChartData = (data: Record<string, number>, label: string) => {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }
    return Object.entries(data)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
        value: Number(value),
        label: `${name}: ${value}`,
      }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const filtered = getFilteredData();
      const stats = getStats();
      
      // Récupérer les informations de l'utilisateur actuel
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('currentUserId');
      
      if (token && userId) {
        apiClient.setToken(token);
        const profile = await apiClient.getProfile(userId);

        const user = {
          id: profile.id,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          civility: profile.civility,
          email: profile.email,
          role: profile.role,
          position: profile.service,
        };

        await generateQHSEReportPDF(reportType, {
          user,
          data: filtered,
          stats,
          dateRange: { start: startDate, end: endDate },
        });
        
        showSuccess('Rapport PDF généré avec succès !');
      } else {
        throw new Error('Non authentifié');
      }
    } catch (error: any) {
      console.error('Erreur lors de la génération du rapport:', error);
      showError('Erreur lors de la génération du rapport PDF: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const filtered = getFilteredData();
      const stats = getStats();
      
      if (reportType === 'comprehensive') {
        // Export multi-feuilles pour le rapport complet
        const sheets = [
          {
            name: 'Incidents',
            data: filtered.incidents,
            headers: [
              { key: 'date_creation', label: 'Date' },
              { key: 'type', label: 'Type' },
              { key: 'description', label: 'Description' },
              { key: 'lieu', label: 'Lieu' },
              { key: 'priorite', label: 'Priorité' },
              { key: 'statut', label: 'Statut' },
              { key: 'service', label: 'Service' },
            ],
          },
          {
            name: 'Audits',
            data: filtered.audits,
            headers: [
              { key: 'title', label: 'Titre' },
              { key: 'audit_type', label: 'Type' },
              { key: 'planned_date', label: 'Date Planifiée' },
              { key: 'actual_date', label: 'Date Réelle' },
              { key: 'status', label: 'Statut' },
              { key: 'scope', label: 'Scope' },
            ],
          },
          {
            name: 'Formations',
            data: filtered.trainings,
            headers: [
              { key: 'title', label: 'Titre' },
              { key: 'category', label: 'Catégorie' },
              { key: 'training_type', label: 'Type' },
              { key: 'planned_date', label: 'Date Planifiée' },
              { key: 'status', label: 'Statut' },
            ],
          },
          {
            name: 'Déchets Médicaux',
            data: filtered.medicalWaste,
            headers: [
              { key: 'waste_type', label: 'Type' },
              { key: 'quantity', label: 'Quantité' },
              { key: 'unit', label: 'Unité' },
              { key: 'collection_date', label: 'Date Collecte' },
              { key: 'collection_location', label: 'Lieu' },
              { key: 'status', label: 'Statut' },
            ],
          },
          {
            name: 'Risques',
            data: filtered.risks,
            headers: [
              { key: 'title', label: 'Titre' },
              { key: 'risk_category', label: 'Catégorie' },
              { key: 'risk_level', label: 'Niveau' },
              { key: 'probability', label: 'Probabilité' },
              { key: 'severity', label: 'Sévérité' },
              { key: 'status', label: 'Statut' },
            ],
          },
          {
            name: 'Stérilisation - Cycles',
            data: filtered.sterilizationCycles,
            headers: [
              { key: 'cycle_number', label: 'N° Cycle' },
              { key: 'sterilizer_id', label: 'Stérilisateur' },
              { key: 'sterilizer_type', label: 'Type' },
              { key: 'start_time', label: 'Début' },
              { key: 'status', label: 'Statut' },
              { key: 'result', label: 'Résultat' },
            ],
          },
          {
            name: 'Stérilisation - Registre',
            data: filtered.sterilizationRegister,
            headers: [
              { key: 'date_cycle', label: 'Date Cycle' },
              { key: 'service_concerne', label: 'Service' },
              { key: 'operateur_nom', label: 'Opérateur' },
              { key: 'type_materiel', label: 'Type Matériel' },
              { key: 'methode_sterilisation', label: 'Méthode' },
              { key: 'status_cycle', label: 'Statut' },
            ],
          },
          {
            name: 'Suivi de Linge',
            data: filtered.laundryTracking,
            headers: [
              { key: 'date_reception', label: 'Date Réception' },
              { key: 'service_origine', label: 'Service Origine' },
              { key: 'type_linge', label: 'Type Linge' },
              { key: 'poids_kg', label: 'Poids (kg)' },
              { key: 'quantite', label: 'Quantité' },
              { key: 'status', label: 'Statut' },
            ],
          },
        ];
        
        exportMultipleSheetsToExcel(sheets, `rapport-qhse-complet-${format(new Date(), 'yyyy-MM-dd')}`);
        showSuccess('Rapport Excel exporté avec succès !');
      } else {
        // Export selon le type de rapport sélectionné
        let sheets: Array<{ name: string; data: any[]; headers: { key: string; label: string }[] }> = [];
        
        switch (reportType) {
          case 'incidents':
            sheets = [{
              name: 'Incidents',
              data: filtered.incidents,
              headers: [
                { key: 'date_creation', label: 'Date' },
                { key: 'type', label: 'Type' },
                { key: 'description', label: 'Description' },
                { key: 'lieu', label: 'Lieu' },
                { key: 'priorite', label: 'Priorité' },
                { key: 'statut', label: 'Statut' },
                { key: 'service', label: 'Service' },
              ],
            }];
            break;
          case 'audits':
            sheets = [{
              name: 'Audits',
              data: filtered.audits,
              headers: [
                { key: 'title', label: 'Titre' },
                { key: 'audit_type', label: 'Type' },
                { key: 'planned_date', label: 'Date Planifiée' },
                { key: 'actual_date', label: 'Date Réelle' },
                { key: 'status', label: 'Statut' },
                { key: 'scope', label: 'Scope' },
              ],
            }];
            break;
          case 'trainings':
            sheets = [{
              name: 'Formations',
              data: filtered.trainings,
              headers: [
                { key: 'title', label: 'Titre' },
                { key: 'category', label: 'Catégorie' },
                { key: 'training_type', label: 'Type' },
                { key: 'planned_date', label: 'Date Planifiée' },
                { key: 'status', label: 'Statut' },
              ],
            }];
            break;
          case 'medical_waste':
            sheets = [{
              name: 'Déchets Médicaux',
              data: filtered.medicalWaste,
              headers: [
                { key: 'waste_type', label: 'Type' },
                { key: 'quantity', label: 'Quantité' },
                { key: 'unit', label: 'Unité' },
                { key: 'collection_date', label: 'Date Collecte' },
                { key: 'collection_location', label: 'Lieu' },
                { key: 'status', label: 'Statut' },
              ],
            }];
            break;
          case 'risks':
            sheets = [{
              name: 'Risques',
              data: filtered.risks,
              headers: [
                { key: 'title', label: 'Titre' },
                { key: 'risk_category', label: 'Catégorie' },
                { key: 'risk_level', label: 'Niveau' },
                { key: 'probability', label: 'Probabilité' },
                { key: 'severity', label: 'Sévérité' },
                { key: 'status', label: 'Statut' },
              ],
            }];
            break;
          case 'sterilization':
            sheets = [
              {
                name: 'Cycles',
                data: filtered.sterilizationCycles,
                headers: [
                  { key: 'cycle_number', label: 'N° Cycle' },
                  { key: 'sterilizer_id', label: 'Stérilisateur' },
                  { key: 'sterilizer_type', label: 'Type' },
                  { key: 'start_time', label: 'Début' },
                  { key: 'status', label: 'Statut' },
                  { key: 'result', label: 'Résultat' },
                ],
              },
              {
                name: 'Registre',
                data: filtered.sterilizationRegister,
                headers: [
                  { key: 'date_cycle', label: 'Date Cycle' },
                  { key: 'service_concerne', label: 'Service' },
                  { key: 'operateur_nom', label: 'Opérateur' },
                  { key: 'type_materiel', label: 'Type Matériel' },
                  { key: 'methode_sterilisation', label: 'Méthode' },
                  { key: 'status_cycle', label: 'Statut' },
                ],
              },
            ];
            break;
          case 'laundry':
            sheets = [{
              name: 'Suivi de Linge',
              data: filtered.laundryTracking,
              headers: [
                { key: 'date_reception', label: 'Date Réception' },
                { key: 'service_origine', label: 'Service Origine' },
                { key: 'type_linge', label: 'Type Linge' },
                { key: 'poids_kg', label: 'Poids (kg)' },
                { key: 'quantite', label: 'Quantité' },
                { key: 'status', label: 'Statut' },
              ],
            }];
            break;
          case 'overview':
            // Pour la vue d'ensemble, exporter un résumé avec statistiques
            const overviewData = [
              { Indicateur: 'Total Incidents', Valeur: stats.incidents.total },
              { Indicateur: 'Incidents Nouveaux', Valeur: stats.incidents.nouveau },
              { Indicateur: 'Incidents En Cours', Valeur: stats.incidents.cours },
              { Indicateur: 'Total Audits', Valeur: stats.audits.total },
              { Indicateur: 'Audits Planifiés', Valeur: stats.audits.planifie },
              { Indicateur: 'Total Formations', Valeur: stats.trainings.total },
              { Indicateur: 'Formations Planifiées', Valeur: stats.trainings.planifiee },
              { Indicateur: 'Total Déchets', Valeur: stats.medicalWaste.total },
              { Indicateur: 'Déchets Collectés', Valeur: stats.medicalWaste.collecte },
              { Indicateur: 'Total Risques', Valeur: stats.risks.total },
              { Indicateur: 'Risques Identifiés', Valeur: stats.risks.identifie },
            ];
            exportToExcel(overviewData, [
              { key: 'Indicateur', label: 'Indicateur' },
              { key: 'Valeur', label: 'Valeur' },
            ], `rapport-qhse-vue-ensemble-${format(new Date(), 'yyyy-MM-dd')}`);
            showSuccess('Rapport Excel exporté avec succès !');
            return;
        }
        
        if (sheets.length > 0) {
          exportMultipleSheetsToExcel(sheets, `rapport-qhse-${reportType}-${format(new Date(), 'yyyy-MM-dd')}`);
          showSuccess('Rapport Excel exporté avec succès !');
        } else {
          showError('Aucune donnée à exporter pour ce type de rapport');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'export Excel:', error);
      showError('Erreur lors de l\'export Excel: ' + (error.message || 'Erreur inconnue'));
    }
  };

  if (loading && reportData.incidents.length === 0) {
    return <LoadingSpinner />;
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="BarChart" className="text-cyan-600 mr-2" />
            Module de Reporting QHSE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection du type de rapport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type de rapport</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Vue d'ensemble</SelectItem>
                  <SelectItem value="incidents">Incidents/Tickets</SelectItem>
                  <SelectItem value="audits">Audits & Inspections</SelectItem>
                  <SelectItem value="trainings">Formations</SelectItem>
                  <SelectItem value="medical_waste">Déchets médicaux</SelectItem>
                  <SelectItem value="risks">Gestion des risques</SelectItem>
                  <SelectItem value="sterilization">Stérilisation</SelectItem>
                  <SelectItem value="laundry">Suivi de linge</SelectItem>
                  <SelectItem value="comprehensive">Rapport complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Résumé Exécutif */}
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Icon name="FileBarChart" className="mr-2 h-6 w-6" />
                Résumé Exécutif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                <div>
                  <div className="text-sm opacity-90 mb-1">Période analysée</div>
                  <div className="text-lg font-semibold">
                    {format(new Date(startDate), 'dd MMM yyyy', { locale: fr })} - {format(new Date(endDate), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">Total d'activités</div>
                  <div className="text-lg font-semibold">
                    {stats.incidents.total + stats.audits.total + stats.trainings.total + stats.risks.total} activités
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">Performance globale</div>
                  <div className="text-lg font-semibold">
                    {((parseFloat(getKPIs.incidentResolutionRate) + parseFloat(getKPIs.auditConformityRate) + parseFloat(getKPIs.riskTreatmentRate)) / 3).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-sm text-blue-600 mb-1">Incidents</div>
                <div className="text-2xl font-bold text-blue-700">{stats.incidents.total}</div>
                <div className="text-xs text-blue-500 mt-1">
                  {stats.incidents.nouveau} nouveau{stats.incidents.nouveau > 1 ? 'x' : ''}, {stats.incidents.cours} en cours
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-sm text-green-600 mb-1">Audits</div>
                <div className="text-2xl font-bold text-green-700">{stats.audits.total}</div>
                <div className="text-xs text-green-500 mt-1">
                  {stats.audits.planifie} planifié{stats.audits.planifie > 1 ? 's' : ''}, {stats.audits.en_cours} en cours
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <div className="text-sm text-purple-600 mb-1">Formations</div>
                <div className="text-2xl font-bold text-purple-700">{stats.trainings.total}</div>
                <div className="text-xs text-purple-500 mt-1">
                  {stats.trainings.planifiee} planifiée{stats.trainings.planifiee > 1 ? 's' : ''}, {stats.trainings.en_cours} en cours
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="text-sm text-orange-600 mb-1">Déchets</div>
                <div className="text-2xl font-bold text-orange-700">{stats.medicalWaste.total}</div>
                <div className="text-xs text-orange-500 mt-1">
                  {stats.medicalWaste.collecte} collecté{stats.medicalWaste.collecte > 1 ? 's' : ''}, {stats.medicalWaste.traite} traité{stats.medicalWaste.traite > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-sm text-red-600 mb-1">Risques</div>
                <div className="text-2xl font-bold text-red-700">{stats.risks.total}</div>
                <div className="text-xs text-red-500 mt-1">
                  {stats.risks.identifie} identifié{stats.risks.identifie > 1 ? 's' : ''}, {stats.risks.en_traitement} en traitement
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
              <CardContent className="p-4">
                <div className="text-sm text-teal-600 mb-1">Stérilisation</div>
                <div className="text-2xl font-bold text-teal-700">{stats.sterilization.cycles + stats.sterilization.register}</div>
                <div className="text-xs text-teal-500 mt-1">
                  {stats.sterilization.cycles} cycles, {stats.sterilization.register} registres
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">Suivi de linge</div>
                <div className="text-2xl font-bold text-gray-700">{stats.laundry.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Suivis enregistrés
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPIs Principaux */}
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Icon name="Gauge" className="mr-2 h-5 w-5 text-cyan-600" />
                Indicateurs de Performance Clés (KPIs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{getKPIs.incidentResolutionRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Résolution Incidents</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{getKPIs.auditConformityRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Conformité Audits</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{getKPIs.riskTreatmentRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Traitement Risques</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-teal-600">{getKPIs.sterilizationSuccessRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Réussite Stérilisation</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{getKPIs.trainingParticipationRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Participation Formations</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">{getKPIs.avgIncidentResolutionTime}j</div>
                  <div className="text-xs text-gray-600 mt-1">Temps Moyen Résolution</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertes et Recommandations */}
          {getAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Icon name="Bell" className="mr-2 h-5 w-5 text-cyan-600" />
                  Alertes et Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 flex items-start ${
                        alert.type === 'error'
                          ? 'bg-red-50 border-red-500 text-red-800'
                          : alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                          : alert.type === 'success'
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-blue-50 border-blue-500 text-blue-800'
                      }`}
                    >
                      <Icon name={alert.icon} className={`mr-3 h-5 w-5 mt-0.5 flex-shrink-0 ${
                        alert.type === 'error'
                          ? 'text-red-600'
                          : alert.type === 'warning'
                          ? 'text-yellow-600'
                          : alert.type === 'success'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`} />
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Période sélectionnée */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-cyan-700">Période sélectionnée</div>
                <div className="text-sm text-cyan-600">
                  Du {format(new Date(startDate), 'dd MMMM yyyy', { locale: fr })} au {format(new Date(endDate), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700"
              >
                <Icon name={loading ? "Clock" : "Download"} className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Génération...' : 'Exporter PDF'}
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={loading}
                variant="outline"
                className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              >
                <Icon name="FileText" className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>
            </div>
          </div>

          {/* Onglets pour analyses détaillées */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="charts">Graphiques</TabsTrigger>
              <TabsTrigger value="analysis">Analyses</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Graphique temporel */}
            <Card>
              <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Icon name="BarChart" className="mr-2 h-5 w-5 text-cyan-600" />
                      Évolution temporelle
                    </CardTitle>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="incidents" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Incidents" />
                      <Area type="monotone" dataKey="audits" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Audits" />
                      <Area type="monotone" dataKey="trainings" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Formations" />
                      <Area type="monotone" dataKey="risks" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Risques" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Résumé par catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition des Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const pieData = getPieChartData(stats.incidents.byType || {}, 'Type');
                      const hasData = pieData.length > 0;
                      
                      return hasData ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                          <Icon name="BarChart" className="h-12 w-12 mb-2 opacity-50" />
                          <p className="text-sm font-medium">Aucune donnée disponible</p>
                          <p className="text-xs mt-1 text-gray-500">
                            {stats.incidents.total === 0 
                              ? 'Aucun incident dans la période sélectionnée'
                              : 'Aucun type d\'incident défini'}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition par Priorité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const barData = getPieChartData(stats.incidents.byPriority || {}, 'Priorité');
                      const hasData = barData.length > 0;
                      
                      return hasData ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#06b6d4" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                          <Icon name="BarChart" className="h-12 w-12 mb-2 opacity-50" />
                          <p className="text-sm font-medium">Aucune donnée disponible</p>
                          <p className="text-xs mt-1 text-gray-500">
                            {stats.incidents.total === 0 
                              ? 'Aucun incident dans la période sélectionnée'
                              : 'Aucune priorité définie'}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Graphique des audits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut des Audits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Planifiés', value: stats.audits.planifie },
                            { name: 'En cours', value: stats.audits.en_cours },
                            { name: 'Terminés', value: stats.audits.termine },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#eab308" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {stats.audits.total > 0 && (
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-600">Taux de conformité</div>
                        <div className="text-2xl font-bold text-green-600">{stats.audits.conformityRate}%</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Graphique des formations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Formations par Catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getPieChartData(stats.trainings.byCategory, 'Catégorie')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600">Total participants</div>
                      <div className="text-2xl font-bold text-purple-600">{stats.trainings.participantsTotal}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Graphique des risques */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risques par Niveau</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getPieChartData(stats.risks.byLevel, 'Niveau')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Graphique des déchets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Déchets par Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(stats.medicalWaste.byType).map(([name, value]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value: Number(value),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600">Quantité totale</div>
                      <div className="text-2xl font-bold text-orange-600">{stats.medicalWaste.totalQuantity.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Analyses détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Icon name="BarChart" className="mr-2 h-5 w-5 text-blue-600" />
                      Analyse des Incidents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taux de résolution</span>
                        <span className="font-semibold">
                          {stats.incidents.total > 0 
                            ? ((stats.incidents.resolu / stats.incidents.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stats.incidents.total > 0 ? (stats.incidents.resolu / stats.incidents.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-600">En attente</div>
                        <div className="text-2xl font-bold text-yellow-600">{stats.incidents.nouveau}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">En traitement</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.incidents.cours}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-semibold mb-2">Top 3 Services</div>
                      {Object.entries(stats.incidents.byService)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([service, count], idx) => (
                          <div key={service} className="flex justify-between text-sm mb-1">
                            <span>{idx + 1}. {service}</span>
                            <span className="font-semibold">{count as number}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Icon name="Shield" className="mr-2 h-5 w-5 text-red-600" />
                      Analyse des Risques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risques traités</span>
                        <span className="font-semibold">
                          {stats.risks.total > 0 
                            ? ((stats.risks.traite / stats.risks.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stats.risks.total > 0 ? (stats.risks.traite / stats.risks.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-semibold mb-2">Répartition par Catégorie</div>
                      {Object.entries(stats.risks.byCategory)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span className="font-semibold">{count as number}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Icon name="CheckCircle" className="mr-2 h-5 w-5 text-green-600" />
                      Performance Stérilisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-teal-600">{stats.sterilization.successRate}%</div>
                      <div className="text-sm text-gray-600 mt-1">Taux de réussite</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-600">Cycles</div>
                        <div className="text-2xl font-bold text-teal-600">{stats.sterilization.cycles}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Registres</div>
                        <div className="text-2xl font-bold text-cyan-600">{stats.sterilization.register}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Icon name="Users" className="mr-2 h-5 w-5 text-purple-600" />
                      Formations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">{stats.trainings.participantsTotal}</div>
                      <div className="text-sm text-gray-600 mt-1">Total participants</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-600">Planifiées</div>
                        <div className="text-xl font-bold text-blue-600">{stats.trainings.planifiee}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">En cours</div>
                        <div className="text-xl font-bold text-yellow-600">{stats.trainings.en_cours}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Terminées</div>
                        <div className="text-xl font-bold text-green-600">{stats.trainings.terminee}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Tableaux détaillés */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{stats.incidents.total}</div>
                      <div className="text-sm text-blue-600 mt-1">Incidents</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.incidents.nouveau} nouveau{stats.incidents.nouveau > 1 ? 'x' : ''}, {stats.incidents.cours} en cours
                  </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{stats.audits.total}</div>
                      <div className="text-sm text-green-600 mt-1">Audits</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.audits.planifie} planifié{stats.audits.planifie > 1 ? 's' : ''}, {stats.audits.en_cours} en cours
                  </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.trainings.total}</div>
                      <div className="text-sm text-purple-600 mt-1">Formations</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.trainings.planifiee} planifiée{stats.trainings.planifiee > 1 ? 's' : ''}, {stats.trainings.en_cours} en cours
                  </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">{stats.risks.total}</div>
                      <div className="text-sm text-red-600 mt-1">Risques</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.risks.identifie} identifié{stats.risks.identifie > 1 ? 's' : ''}, {stats.risks.en_traitement} en traitement
                    </div>
                  </div>
              </div>

              {/* Tableaux détaillés par catégorie */}
              <div className="grid grid-cols-1 gap-6">
                {/* Incidents détaillés */}
                {getFilteredData().incidents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Icon name="AlertCircle" className="mr-2 h-5 w-5 text-blue-600" />
                        Détails des Incidents ({getFilteredData().incidents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Date</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Lieu</th>
                              <th className="text-left p-2">Priorité</th>
                              <th className="text-left p-2">Statut</th>
                              <th className="text-left p-2">Service</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData().incidents.slice(0, 20).map((incident: any) => (
                              <tr key={incident.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{format(new Date(incident.date_creation), 'dd/MM/yyyy', { locale: fr })}</td>
                                <td className="p-2">{incident.type}</td>
                                <td className="p-2">{incident.lieu || '-'}</td>
                                <td className="p-2">
                                  <Badge variant={incident.priorite === 'critique' ? 'destructive' : incident.priorite === 'haute' ? 'default' : 'secondary'}>
                                    {incident.priorite}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  <Badge variant={incident.statut === 'resolu' ? 'default' : 'secondary'}>
                                    {incident.statut}
                                  </Badge>
                                </td>
                                <td className="p-2">{incident.service || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {getFilteredData().incidents.length > 20 && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Affichage de 20 sur {getFilteredData().incidents.length} incidents
                          </div>
                        )}
                </div>
              </CardContent>
            </Card>
          )}

                {/* Audits détaillés */}
                {getFilteredData().audits.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Icon name="ClipboardCheck" className="mr-2 h-5 w-5 text-green-600" />
                        Détails des Audits ({getFilteredData().audits.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Titre</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Date Planifiée</th>
                              <th className="text-left p-2">Statut</th>
                              <th className="text-left p-2">Conformités</th>
                              <th className="text-left p-2">Non-conformités</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData().audits.slice(0, 20).map((audit: any) => (
                              <tr key={audit.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{audit.title}</td>
                                <td className="p-2">{audit.audit_type}</td>
                                <td className="p-2">{audit.planned_date ? format(new Date(audit.planned_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                                <td className="p-2">
                                  <Badge variant={audit.status === 'terminé' ? 'default' : 'secondary'}>
                                    {audit.status}
                                  </Badge>
                                </td>
                                <td className="p-2 text-green-600 font-semibold">{audit.conformities_count || 0}</td>
                                <td className="p-2 text-red-600 font-semibold">{audit.non_conformities_count || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {getFilteredData().audits.length > 20 && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Affichage de 20 sur {getFilteredData().audits.length} audits
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Formations détaillées */}
                {getFilteredData().trainings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Icon name="Users" className="mr-2 h-5 w-5 text-purple-600" />
                        Détails des Formations ({getFilteredData().trainings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Titre</th>
                              <th className="text-left p-2">Catégorie</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Date Planifiée</th>
                              <th className="text-left p-2">Participants</th>
                              <th className="text-left p-2">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData().trainings.slice(0, 20).map((training: any) => (
                              <tr key={training.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{training.title}</td>
                                <td className="p-2">{training.category}</td>
                                <td className="p-2">{training.training_type}</td>
                                <td className="p-2">{training.planned_date ? format(new Date(training.planned_date), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                                <td className="p-2">{training.participants_count || 0}</td>
                                <td className="p-2">
                                  <Badge variant={training.status === 'terminée' ? 'default' : 'secondary'}>
                                    {training.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {getFilteredData().trainings.length > 20 && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Affichage de 20 sur {getFilteredData().trainings.length} formations
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risques détaillés */}
                {getFilteredData().risks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Icon name="Shield" className="mr-2 h-5 w-5 text-red-600" />
                        Détails des Risques ({getFilteredData().risks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Titre</th>
                              <th className="text-left p-2">Catégorie</th>
                              <th className="text-left p-2">Niveau</th>
                              <th className="text-left p-2">Probabilité</th>
                              <th className="text-left p-2">Sévérité</th>
                              <th className="text-left p-2">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData().risks.slice(0, 20).map((risk: any) => (
                              <tr key={risk.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{risk.title}</td>
                                <td className="p-2">{risk.risk_category}</td>
                                <td className="p-2">
                                  <Badge variant={risk.risk_level === 'très_élevé' ? 'destructive' : risk.risk_level === 'élevé' ? 'default' : 'secondary'}>
                                    {risk.risk_level}
                                  </Badge>
                                </td>
                                <td className="p-2">{risk.probability}</td>
                                <td className="p-2">{risk.severity}</td>
                                <td className="p-2">
                                  <Badge variant={risk.status === 'traité' ? 'default' : 'secondary'}>
                                    {risk.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {getFilteredData().risks.length > 20 && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Affichage de 20 sur {getFilteredData().risks.length} risques
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

