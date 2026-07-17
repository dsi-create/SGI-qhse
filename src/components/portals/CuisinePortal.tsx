import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/Icon";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { User, PlannedTask, Notification, Incident } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PortalHero } from "@/components/layout/PortalHero";

interface PortalProps {
  user: User;
  plannedTasks: PlannedTask[];
  notifications: Notification[];
  incidents: Incident[];
  onNavigate: (tabId: string) => void;
}

export const CuisinePortal = ({ user, plannedTasks, notifications, incidents, onNavigate }: PortalProps) => {
  const today = new Date();
  const myTasks = plannedTasks.filter((t) => t.assigned_to === user.id);
  const pending = myTasks.filter((t) => t.status === "à faire" || t.status === "en_cours").length;
  const myIncidents = incidents.filter((i) => i.reported_by === user.id);
  const unread = notifications.filter((n) => !n.read).length;

  const modules = [
    { id: "cuisineGrocery", title: "Inventaire courses", desc: "Stocks alimentaires et seuils", icon: "PackageSearch", color: "text-amber-600" },
    { id: "cuisineExpenses", title: "Dépenses", desc: "Suivi des achats cuisine", icon: "CreditCard", color: "text-teal-600" },
    { id: "cuisinePatientMeals", title: "Repas patients", desc: "Portions et régimes", icon: "HeartPulse", color: "text-rose-600" },
    { id: "cuisineEmployeeMeals", title: "Repas employés", desc: "Menus et portions servies", icon: "Users", color: "text-cyan-600" },
    { id: "cuisineMealPlanning", title: "Planning menus", desc: "Organisation hebdomadaire", icon: "CalendarDays", color: "text-indigo-600" },
    { id: "planningTasks", title: "Planning tâches", desc: "Tâches assignées à l'équipe", icon: "CalendarPlus", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8 fade-in">
      <PortalHero
        icon="Utensils"
        title="Portail Cuisine"
        subtitle={`${user.civility} ${user.first_name} ${user.last_name}`}
        description={`${format(today, "EEEE d MMMM yyyy", { locale: fr })} — Courses, dépenses, repas et planning`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard
          title="Mes tâches"
          value={pending}
          iconName="ClipboardList"
          colorClass="bg-amber-100 text-amber-700"
          onClick={() => onNavigate("myTasks")}
        />
        <DashboardCard
          title="Mes signalements"
          value={myIncidents.length}
          iconName="AlertCircle"
          colorClass="bg-red-100 text-red-600"
        />
        <DashboardCard
          title="Notifications"
          value={unread}
          iconName="Bell"
          colorClass="bg-cyan-100 text-cyan-700"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[hsl(var(--brand-navy))]">Modules cuisine</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Card key={mod.id} className="card-hover cursor-pointer" onClick={() => onNavigate(mod.id)}>
              <CardContent className="p-5">
                <Icon name={mod.icon} className={`mb-3 text-3xl ${mod.color}`} />
                <h3 className="mb-1 font-semibold">{mod.title}</h3>
                <p className="text-sm text-slate-600">{mod.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="card-hover cursor-pointer" onClick={() => onNavigate("reportIncident")}>
          <CardContent className="p-5">
            <Icon name="AlertCircle" className="mb-3 text-3xl text-red-600" />
            <h3 className="mb-1 font-semibold">Signaler un incident</h3>
            <p className="text-sm text-slate-600">Déclarer un problème</p>
          </CardContent>
        </Card>
        <Card className="card-hover cursor-pointer" onClick={() => onNavigate("personalInfo")}>
          <CardContent className="p-5">
            <Icon name="User" className="mb-3 text-3xl text-slate-700" />
            <h3 className="mb-1 font-semibold">Mes infos</h3>
            <p className="text-sm text-slate-600">Profil et mot de passe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
