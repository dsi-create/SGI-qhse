import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Bar, LineChart, Line, AreaChart, Area } from 'recharts';
import { Icon } from "@/components/Icon";
import { Incident, BiomedicalEquipment, PlannedTask, Visitor, Booking, Users, MaintenanceTask, User } from "@/types";
import { DashboardCard } from "../shared/DashboardCard";
import { 
  filterIncidentsByRole, 
  filterVisitorsByRole, 
  filterPlannedTasksByRole, 
  filterMaintenanceTasksByRole, 
  filterBookingsByRole, 
  filterBiomedicalEquipmentByRole 
} from "@/utils/kpiFilter";
import { useMemo } from "react";

interface KpiDashboardProps {
  incidents: Incident[];
  biomedicalEquipment: BiomedicalEquipment[];
  plannedTasks: PlannedTask[];
  visitors: Visitor[];
  bookings: Booking[];
  users: Users;
  maintenanceTasks: MaintenanceTask[];
  currentUser: User;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const KpiDashboard = ({ incidents, biomedicalEquipment, plannedTasks, visitors, bookings, users, maintenanceTasks, currentUser }: KpiDashboardProps) => {
  // Filtrer les données selon le rôle de l'utilisateur
  const filteredIncidents = filterIncidentsByRole(incidents, currentUser, users);
  const filteredVisitors = filterVisitorsByRole(visitors, currentUser, users);
  const filteredPlannedTasks = filterPlannedTasksByRole(plannedTasks, currentUser, users);
  const filteredMaintenanceTasks = filterMaintenanceTasksByRole(maintenanceTasks, currentUser, users);
  const filteredBookings = filterBookingsByRole(bookings, currentUser);
  const filteredBiomedicalEquipment = filterBiomedicalEquipmentByRole(biomedicalEquipment, currentUser);

  // --- Security KPIs ---
  const securityIncidents = filteredIncidents.filter(i => i.service === 'securite');
  const securityIncidentsByType = securityIncidents.reduce((acc, incident) => {
    const type = incident.type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const securityIncidentsByPriority = securityIncidents.reduce((acc, incident) => {
    const priority = incident.priorite;
    const existing = acc.find(item => item.name === priority);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: priority, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const visitorsToday = filteredVisitors.filter(v => new Date(v.entry_time).toDateString() === new Date().toDateString()).length;
  const totalVisitors = filteredVisitors.length;

  // --- Maintenance KPIs ---
  const maintenanceIncidents = filteredIncidents.filter(i => i.service === 'entretien');
  const maintenanceIncidentsByType = maintenanceIncidents.reduce((acc, incident) => {
    const type = incident.type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const maintenanceTasksByStatus = filteredPlannedTasks.filter(t => t.assigned_to && ['agent_entretien', 'superviseur_agent_entretien'].includes(t.assigned_to in users ? users[t.assigned_to].role : '')).reduce((acc, task) => {
    const status = task.status;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);


  // --- Technical KPIs ---
  const technicalIncidents = filteredIncidents.filter(i => i.service === 'technique');
  const technicalIncidentsByType = technicalIncidents.reduce((acc, incident) => {
    const type = incident.type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const technicalIncidentsByStatus = technicalIncidents.reduce((acc, incident) => {
    const status = incident.statut;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const totalPlannedMaintenanceTasks = filteredPlannedTasks.filter(t => t.assigned_to && ['technicien', 'superviseur_technicien'].includes(t.assigned_to in users ? users[t.assigned_to].role : '')).length;


  // --- Biomedical KPIs ---
  const equipmentByStatus = filteredBiomedicalEquipment.reduce((acc, eq) => {
    const status = eq.status;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const maintenanceTasksByType = filteredMaintenanceTasks.reduce((acc, task) => {
    const type = task.type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  // --- Planning KPIs ---
  const bookingsByRoom = filteredBookings.reduce((acc, booking) => {
    const roomName = booking.room_id; // Assuming roomId is descriptive enough or map to room.name
    const existing = acc.find(item => item.name === roomName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: roomName, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const bookingsByReason = filteredBookings.reduce((acc, booking) => {
    const title = booking.title;
    const existing = acc.find(item => item.name === title);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: title, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  // Calcul des KPIs globaux
  const globalKPIs = useMemo(() => {
    const totalIncidents = filteredIncidents.length;
    const resolvedIncidents = filteredIncidents.filter(i => i.statut === 'resolu' || i.statut === 'traite').length;
    const resolutionRate = totalIncidents > 0 ? ((resolvedIncidents / totalIncidents) * 100).toFixed(1) : '0';
    
    const pendingIncidents = filteredIncidents.filter(i => i.statut === 'nouveau' || i.statut === 'cours').length;
    const criticalIncidents = filteredIncidents.filter(i => i.priorite === 'critique' || i.priorite === 'haute').length;
    
    const totalEquipment = filteredBiomedicalEquipment.length;
    const activeEquipment = filteredBiomedicalEquipment.filter(eq => eq.status === 'actif' || eq.status === 'en_service').length;
    const equipmentAvailability = totalEquipment > 0 ? ((activeEquipment / totalEquipment) * 100).toFixed(1) : '0';
    
    const totalTasks = filteredPlannedTasks.length;
    const completedTasks = filteredPlannedTasks.filter(t => t.status === 'termine' || t.status === 'resolu').length;
    const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
    
    // Calcul du temps moyen de résolution (en jours)
    const resolvedIncidentsWithDates = filteredIncidents.filter(i => 
      (i.statut === 'resolu' || i.statut === 'traite') && i.date_creation && i.date_resolution
    );
    const avgResolutionTime = resolvedIncidentsWithDates.length > 0
      ? (resolvedIncidentsWithDates.reduce((sum, i) => {
          const created = new Date(i.date_creation);
          const resolved = new Date(i.date_resolution);
          const days = Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / resolvedIncidentsWithDates.length).toFixed(1)
      : '0';

    return {
      totalIncidents,
      resolvedIncidents,
      resolutionRate,
      pendingIncidents,
      criticalIncidents,
      totalEquipment,
      activeEquipment,
      equipmentAvailability,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      avgResolutionTime
    };
  }, [filteredIncidents, filteredBiomedicalEquipment, filteredPlannedTasks]);

  // Répartition des incidents par statut pour graphique
  const incidentsByStatus = useMemo(() => {
    return filteredIncidents.reduce((acc, incident) => {
      const status = incident.statut || 'Non spécifié';
      const existing = acc.find(item => item.name === status);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: status, value: 1 });
      }
      return acc;
    }, [] as { name: string, value: number }[]);
  }, [filteredIncidents]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Icon name="BarChart" className="text-blue-600 mr-3 h-8 w-8" />Tableau de Bord KPIs
        </h2>
        <div className="text-sm text-gray-500">
          Mis à jour en temps réel
        </div>
      </div>

      {/* KPIs Globaux - Vue d'ensemble */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
          <Icon name="TrendingUp" className="text-indigo-500 mr-2" /> Vue d'Ensemble
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux de Résolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-blue-600">{globalKPIs.resolutionRate}%</div>
                <div className="text-xs text-gray-500">
                  {globalKPIs.resolvedIncidents}/{globalKPIs.totalIncidents}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Incidents résolus
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-orange-600">{globalKPIs.pendingIncidents}</div>
                {globalKPIs.criticalIncidents > 0 && (
                  <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                    {globalKPIs.criticalIncidents} critique{globalKPIs.criticalIncidents > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Incidents en cours
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Disponibilité Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-green-600">{globalKPIs.equipmentAvailability}%</div>
                <div className="text-xs text-gray-500">
                  {globalKPIs.activeEquipment}/{globalKPIs.totalEquipment}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Équipements actifs
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taux de Complétion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-purple-600">{globalKPIs.taskCompletionRate}%</div>
                <div className="text-xs text-gray-500">
                  {globalKPIs.completedTasks}/{globalKPIs.totalTasks}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Tâches complétées
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique de répartition des incidents par statut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Activity" className="text-indigo-500 mr-2" />
                Répartition des Incidents par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentsByStatus}>
                  <defs>
                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStatus)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Clock" className="text-teal-500 mr-2" />
                Métriques de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="Clock" className="text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Temps moyen de résolution</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{globalKPIs.avgResolutionTime} jours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="CheckCircle" className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Total incidents résolus</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{globalKPIs.resolvedIncidents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="AlertCircle" className="text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Incidents critiques</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{globalKPIs.criticalIncidents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="Target" className="text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Taux de complétion tâches</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{globalKPIs.taskCompletionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security KPIs */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Icon name="Shield" className="text-blue-500 mr-2" /> Sécurité & Accueil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DashboardCard title="Visiteurs Aujourd'hui" value={visitorsToday} iconName="BookUser" colorClass="bg-blue-100 text-blue-600" />
          <DashboardCard title="Total Visiteurs" value={totalVisitors} iconName="Users" colorClass="bg-blue-100 text-blue-600" />
          <DashboardCard title="Incidents Sécurité" value={securityIncidents.length} iconName="AlertTriangle" colorClass="bg-red-100 text-red-600" />
          <DashboardCard 
            title="Taux Résolution" 
            value={securityIncidents.length > 0 
              ? `${((securityIncidents.filter(i => i.statut === 'resolu' || i.statut === 'traite').length / securityIncidents.length) * 100).toFixed(1)}%`
              : '0%'
            } 
            iconName="CheckCircle" 
            colorClass="bg-green-100 text-green-600" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PieChart" className="text-blue-500 mr-2" />
                Incidents Sécurité par Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={securityIncidentsByType} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {securityIncidentsByType.map((entry, index) => (
                      <Cell key={`cell-sec-type-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart" className="text-blue-500 mr-2" />
                Incidents Sécurité par Priorité
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={securityIncidentsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Maintenance KPIs */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Icon name="SprayCan" className="text-green-500 mr-2" /> Entretien
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DashboardCard title="Incidents Entretien" value={maintenanceIncidents.length} iconName="Wrench" colorClass="bg-green-100 text-green-600" />
          <DashboardCard 
            title="Taux Résolution" 
            value={maintenanceIncidents.length > 0 
              ? `${((maintenanceIncidents.filter(i => i.statut === 'resolu' || i.statut === 'traite').length / maintenanceIncidents.length) * 100).toFixed(1)}%`
              : '0%'
            } 
            iconName="CheckCircle" 
            colorClass="bg-green-100 text-green-600" 
          />
          <DashboardCard title="Tâches Planifiées" value={maintenanceTasksByStatus.reduce((sum, t) => sum + t.value, 0)} iconName="Calendar" colorClass="bg-green-100 text-green-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PieChart" className="text-green-500 mr-2" />
                Problèmes Entretien par Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={maintenanceIncidentsByType} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {maintenanceIncidentsByType.map((entry, index) => (
                      <Cell key={`cell-maint-type-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart" className="text-green-500 mr-2" />
                Tâches Entretien par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceTasksByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technical KPIs */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Icon name="Wrench" className="text-orange-500 mr-2" /> Technique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DashboardCard title="Tâches Maintenance Planifiées" value={totalPlannedMaintenanceTasks} iconName="CalendarPlus" colorClass="bg-orange-100 text-orange-600" />
          <DashboardCard title="Interventions Techniques" value={technicalIncidents.length} iconName="Tool" colorClass="bg-orange-100 text-orange-600" />
          <DashboardCard 
            title="Taux Résolution" 
            value={technicalIncidents.length > 0 
              ? `${((technicalIncidents.filter(i => i.statut === 'resolu' || i.statut === 'traite').length / technicalIncidents.length) * 100).toFixed(1)}%`
              : '0%'
            } 
            iconName="CheckCircle" 
            colorClass="bg-orange-100 text-orange-600" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PieChart" className="text-orange-500 mr-2" />
                Interventions Techniques par Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={technicalIncidentsByType} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {technicalIncidentsByType.map((entry, index) => (
                      <Cell key={`cell-tech-type-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart" className="text-orange-500 mr-2" />
                Interventions Techniques par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicalIncidentsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Biomedical KPIs */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Icon name="HeartPulse" className="text-red-500 mr-2" /> Biomédical
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DashboardCard title="Total Équipements" value={filteredBiomedicalEquipment.length} iconName="Package" colorClass="bg-red-100 text-red-600" />
          <DashboardCard title="Équipements Actifs" value={globalKPIs.activeEquipment} iconName="CheckCircle" colorClass="bg-red-100 text-red-600" />
          <DashboardCard title="Disponibilité" value={`${globalKPIs.equipmentAvailability}%`} iconName="Activity" colorClass="bg-red-100 text-red-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PieChart" className="text-red-500 mr-2" />
                Équipements par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={equipmentByStatus} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {equipmentByStatus.map((entry, index) => (
                      <Cell key={`cell-bio-status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart" className="text-red-500 mr-2" />
                Tâches Maintenance Biomédicale par Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceTasksByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planning KPIs */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <Icon name="CalendarDays" className="text-cyan-600 mr-2" /> Planning des Salles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DashboardCard title="Total Réservations" value={filteredBookings.length} iconName="Calendar" colorClass="bg-cyan-100 text-cyan-600" />
          <DashboardCard title="Salles Utilisées" value={bookingsByRoom.length} iconName="Building" colorClass="bg-cyan-100 text-cyan-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart" className="text-cyan-500 mr-2" />
                Réservations par Salle
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsByRoom}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PieChart" className="text-cyan-500 mr-2" />
                Réservations par Motif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={bookingsByReason.slice(0, 10)} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={70} 
                      label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {bookingsByReason.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-booking-reason-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string) => [`${value} réservation${value > 1 ? 's' : ''}`, name]}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {bookingsByReason.length > 10 && (
                <div className="text-xs text-gray-500 text-center mb-2">
                  Affichage des 10 principaux motifs ({bookingsByReason.length - 10} autres)
                </div>
              )}
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {bookingsByReason.slice(0, 15).map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate" title={entry.name}>
                        {entry.name.length > 25 ? `${entry.name.substring(0, 25)}...` : entry.name}
                      </span>
                      <span className="text-gray-600 font-semibold">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};