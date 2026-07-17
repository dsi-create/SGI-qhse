import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/Icon";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { User, Incident, Visitor, PlannedTask, Notification, Users, BiomedicalEquipment } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PortalHero } from "@/components/layout/PortalHero";

/** Rôles supervisés par le Responsable des Services Généraux */
export const SERVICES_GENERAUX_SUPERVISED_ROLES = [
  "agent_securite",
  "superviseur_agent_securite",
  "agent_entretien",
  "superviseur_agent_entretien",
  "buandiere",
  "biomedical",
  "assistante_qhse",
  "technicien",
  "superviseur_technicien",
  "technicien_polyvalent",
  "cuisine",
] as const;

interface PortalProps {
  user: User;
  incidents: Incident[];
  visitors: Visitor[];
  plannedTasks: PlannedTask[];
  notifications: Notification[];
  users?: Users;
  biomedicalEquipment?: BiomedicalEquipment[];
  onNavigate: (tabId: string) => void;
}

export const ResponsableServicesGenerauxPortal = ({
  user,
  incidents,
  visitors,
  plannedTasks,
  notifications,
  users,
  biomedicalEquipment = [],
  onNavigate,
}: PortalProps) => {
  const today = new Date();
  const todayStr = today.toDateString();

  const team = users
    ? Object.values(users).filter((u) =>
        SERVICES_GENERAUX_SUPERVISED_ROLES.includes(u.role as (typeof SERVICES_GENERAUX_SUPERVISED_ROLES)[number]),
      )
    : [];

  const countByRole = (role: string) => team.filter((u) => u.role === role).length;

  const openIncidents = incidents.filter(
    (i) => i.statut === "nouveau" || i.statut === "cours" || i.statut === "attente",
  );
  const securityOpen = openIncidents.filter((i) => i.service === "securite").length;
  const entretienOpen = openIncidents.filter((i) => i.service === "entretien").length;
  const techniqueOpen = openIncidents.filter(
    (i) => i.service === "technique" || i.service === "biomedical",
  ).length;
  const pendingTasks = plannedTasks.filter((t) => t.status === "à faire" || t.status === "en_cours").length;
  const unread = notifications.filter((n) => !n.read).length;
  const todayVisitors = visitors.filter((v) => new Date(v.entry_time).toDateString() === todayStr).length;
  const equipmentHs = biomedicalEquipment.filter((e) => e.status === "hors_service" || e.status === "en_maintenance").length;

  const services = [
    {
      title: "Sécurité",
      desc: "Agents & superviseur sécurité, incidents, visiteurs",
      icon: "Shield",
      color: "text-blue-600",
      count: countByRole("agent_securite") + countByRole("superviseur_agent_securite"),
      navigate: "dashboardSecurite",
    },
    {
      title: "Cuisine",
      desc: "Équipe cuisine, signalements et tâches",
      icon: "Utensils",
      color: "text-amber-600",
      count: countByRole("cuisine"),
      navigate: "planningTasks",
    },
    {
      title: "Buanderie",
      desc: "Suivi linge et stérilisation",
      icon: "Shirt",
      color: "text-teal-600",
      count: countByRole("buandiere"),
      navigate: "qhseLaundry",
    },
    {
      title: "Entretien",
      desc: "Agents d'entretien et historique",
      icon: "SprayCan",
      color: "text-green-600",
      count: countByRole("agent_entretien") + countByRole("superviseur_agent_entretien"),
      navigate: "dashboardEntretien",
    },
    {
      title: "Biomédical",
      desc: "Équipements et maintenances",
      icon: "HeartPulse",
      color: "text-red-600",
      count: countByRole("biomedical"),
      navigate: "biomedical",
    },
    {
      title: "Assistante QHSE",
      desc: "Tickets, anomalies et formations",
      icon: "UserCog",
      color: "text-cyan-600",
      count: countByRole("assistante_qhse"),
      navigate: "qhseTickets",
    },
    {
      title: "Technicien",
      desc: "Interventions techniques & polyvalents",
      icon: "Wrench",
      color: "text-orange-600",
      count:
        countByRole("technicien") +
        countByRole("superviseur_technicien") +
        countByRole("technicien_polyvalent"),
      navigate: "dashboardTechnicien",
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      <PortalHero
        icon="Building2"
        title="Portail Services Généraux"
        subtitle={`${user.civility} ${user.first_name} ${user.last_name}`}
        description={`${format(today, "EEEE d MMMM yyyy", { locale: fr })} — Pilotage sécurité, cuisine, buanderie, entretien, biomédical, QHSE et technique`}
      >
        {unread > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800">
            <Icon name="Bell" className="h-4 w-4" />
            {unread} notification{unread > 1 ? "s" : ""} non lue{unread > 1 ? "s" : ""}
          </div>
        )}
      </PortalHero>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Effectif supervisé"
          value={team.length}
          iconName="Users"
          colorClass="bg-cyan-100 text-cyan-700"
          onClick={() => onNavigate("kpiDashboard")}
        />
        <DashboardCard
          title="Incidents ouverts"
          value={openIncidents.length}
          iconName="AlertCircle"
          colorClass="bg-red-100 text-red-600"
          onClick={() => onNavigate("qhseTickets")}
        />
        <DashboardCard
          title="Tâches en cours"
          value={pendingTasks}
          iconName="ClipboardList"
          colorClass="bg-amber-100 text-amber-700"
          onClick={() => onNavigate("planningTasks")}
        />
        <DashboardCard
          title="Visiteurs aujourd'hui"
          value={todayVisitors}
          iconName="UserPlus"
          colorClass="bg-blue-100 text-blue-600"
          onClick={() => onNavigate("visitorLog")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard
          title="Sécurité ouverte"
          value={securityOpen}
          iconName="Shield"
          colorClass="bg-blue-100 text-blue-700"
          onClick={() => onNavigate("securityIncidents")}
        />
        <DashboardCard
          title="Entretien ouvert"
          value={entretienOpen}
          iconName="SprayCan"
          colorClass="bg-green-100 text-green-700"
          onClick={() => onNavigate("dashboardEntretien")}
        />
        <DashboardCard
          title="Technique / Bioméd"
          value={techniqueOpen + equipmentHs}
          iconName="HeartPulse"
          colorClass="bg-orange-100 text-orange-700"
          onClick={() => onNavigate("biomedical")}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[hsl(var(--brand-navy))]">Services sous responsabilité</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Card
              key={service.title}
              className="card-hover cursor-pointer"
              onClick={() => onNavigate(service.navigate)}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <Icon name={service.icon} className={`text-3xl ${service.color}`} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {service.count} pers.
                  </span>
                </div>
                <h3 className="mb-1 font-semibold text-[hsl(var(--brand-navy))]">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[hsl(var(--brand-navy))]">Accès rapides</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover cursor-pointer" onClick={() => onNavigate("qhseTickets")}>
            <CardContent className="p-5">
              <Icon name="Ticket" className="mb-3 text-3xl text-cyan-600" />
              <h3 className="mb-1 font-semibold">Gestion tickets</h3>
              <p className="text-sm text-slate-600">Assigner et suivre</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => onNavigate("planningTasks")}>
            <CardContent className="p-5">
              <Icon name="CalendarPlus" className="mb-3 text-3xl text-teal-600" />
              <h3 className="mb-1 font-semibold">Planning tâches</h3>
              <p className="text-sm text-slate-600">Planifier les équipes</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => onNavigate("kpiDashboard")}>
            <CardContent className="p-5">
              <Icon name="BarChart" className="mb-3 text-3xl text-indigo-600" />
              <h3 className="mb-1 font-semibold">KPIs</h3>
              <p className="text-sm text-slate-600">Indicateurs globaux</p>
            </CardContent>
          </Card>
          <Card className="card-hover cursor-pointer" onClick={() => onNavigate("inventory")}>
            <CardContent className="p-5">
              <Icon name="PackageSearch" className="mb-3 text-3xl text-slate-700" />
              <h3 className="mb-1 font-semibold">Inventaire</h3>
              <p className="text-sm text-slate-600">Suivre les ressources</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
