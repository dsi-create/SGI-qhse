import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/Icon';
import { Incident, Users, IncidentPriority, IncidentStatus, User } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TicketComments } from '@/components/qhse/TicketComments';
import { AppFooter } from '@/components/layout/AppFooter';

interface IncidentDetailsPageProps {
  incidents: Incident[];
  users: Users;
  currentUser?: User | null;
}

const priorityClasses: Record<IncidentPriority, string> = {
  haute: "bg-red-500",
  moyenne: "bg-yellow-500",
  faible: "bg-green-500",
  critique: "bg-red-700",
};

const statusClasses: Record<IncidentStatus, string> = {
  nouveau: "bg-blue-500",
  cours: "bg-yellow-500",
  traite: "bg-teal-500",
  resolu: "bg-green-500",
  attente: "bg-gray-500",
};

const IncidentDetailsPage = ({ incidents, users, currentUser }: IncidentDetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const incident = incidents.find(i => i.id === id);

  if (!incident) {
    return (
      <div className="app-shell items-center justify-center px-6 text-center">
        <Icon name="AlertTriangle" className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-3xl font-bold text-[hsl(var(--brand-navy))]">Incident introuvable</h1>
        <p className="mb-6 text-slate-500">La fiche demandée n'existe plus ou vous n'y avez pas accès.</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 px-4 py-2.5 font-semibold text-white shadow-md shadow-cyan-600/20">
          <Icon name="Home" className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const assignedUserName = useMemo(() => {
    if (!incident.assigned_to) return 'Non assigné';
    
    // Utiliser assigned_to_name si disponible (retourné par le backend)
    if (incident.assigned_to_name) {
      return incident.assigned_to_name;
    }
    
    // Sinon, chercher dans la liste des utilisateurs
    const entry = Object.values(users).find(user => user.id === incident.assigned_to);
    if (!entry) return 'Non assigné';
    const parts = [entry.first_name, entry.last_name].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    return entry.name || entry.username;
  }, [incident.assigned_to, incident.assigned_to_name, users]);

  const reportedByUserName = useMemo(() => {
    if (!incident.reported_by) return 'Inconnu';
    const entry = Object.values(users).find(user => user.id === incident.reported_by);
    if (!entry) return 'Inconnu';
    const parts = [entry.first_name, entry.last_name].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    return entry.name || entry.username;
  }, [incident.reported_by, users]);

  return (
    <div className="app-shell">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800">
              <Icon name="ChevronLeft" className="h-4 w-4" />
              Retour
            </Link>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${priorityClasses[incident.priorite]} text-white`}>
                Priorité : {incident.priorite}
              </Badge>
              <Badge className={`${statusClasses[incident.statut]} text-white`}>
                {incident.statut}
              </Badge>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Ticket #{incident.id.substring(0, 12)}
            </p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[hsl(var(--brand-navy))] md:text-4xl">
              {incident.type.replace(/-/g, ' ').toUpperCase()}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Icon name="Calendar" className="h-4 w-4 text-cyan-600" />
                {format(incident.date_creation, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="MapPin" className="h-4 w-4 text-cyan-600" />
                {incident.lieu}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="User" className="h-4 w-4 text-cyan-600" />
                {reportedByUserName}
              </span>
              {incident.assigned_to && (
                <span className="inline-flex items-center gap-2">
                  <Icon name="User" className="h-4 w-4 text-cyan-600" />
                  Assigné à : {assignedUserName}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Icon name="LayoutGrid" className="h-4 w-4 text-cyan-600" />
                Service : {incident.service}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon name="FileText" className="h-5 w-5 text-cyan-600" />
                  Description détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100/60 border border-slate-200 rounded-xl p-6 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {incident.description}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon name="ClipboardList" className="h-5 w-5 text-cyan-600" />
                  Suivi & Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.deadline && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                    <div className="text-sm text-gray-500 uppercase tracking-wider">Échéance</div>
                    <div className="text-base font-semibold text-gray-800">
                      {format(incident.deadline, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                )}

                {/* Historique basique */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="text-sm font-semibold text-cyan-700 mb-3">Historique des actions</div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle2" className="h-5 w-5 text-green-500 mt-0.5" />
                      Ticket créé le {format(incident.date_creation, "dd/MM/yyyy à HH:mm", { locale: fr })} par {reportedByUserName}.
                    </li>
                    {incident.deadline && (
                      <li className="flex items-start gap-2">
                        <Icon name="CalendarClock" className="h-5 w-5 text-orange-500 mt-0.5" />
                        Échéance fixée au {format(incident.deadline, "dd/MM/yyyy à HH:mm", { locale: fr })}.
                      </li>
                    )}
                    {incident.assigned_to && (
                      <li className="flex items-start gap-2">
                        <Icon name="UserCheck" className="h-5 w-5 text-blue-500 mt-0.5" />
                        Ticket assigné à {assignedUserName} le {format(incident.date_creation, "dd/MM/yyyy à HH:mm", { locale: fr })}.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Section Commentaires */}
                {currentUser && (
                  <div className="mt-4">
                    <TicketComments
                      incident={incident}
                      currentUser={currentUser}
                      onCommentAdded={() => {
                        // Rafraîchir la page pour mettre à jour les commentaires
                        window.location.reload();
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {incident.photo_urls && incident.photo_urls.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Icon name="Image" className="h-5 w-5 text-cyan-600" />
                    Preuves & médias
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.photo_urls.map((photoUrl, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={photoUrl}
                        alt={`preuve ${index + 1}`}
                        className="object-cover w-full h-40 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {incident.report && (
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Icon name="Wrench" className="h-5 w-5 text-cyan-600" />
                    Rapport d'intervention
                  </CardTitle>
                  <CardDescription>
                    Rédigé par {incident.report.technician_name} le {format(incident.report.report_date, 'PPP', { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-100/70 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Actions réalisées</h4>
                    <p className="text-sm text-gray-600">{incident.report.actions_taken}</p>
                  </div>
                  <div className="bg-slate-100/70 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Matériel utilisé</h4>
                    <p className="text-sm text-gray-600">{incident.report.materials_used || 'Aucun'}</p>
                  </div>
                  <div className="bg-slate-100/70 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Recommandations</h4>
                    <p className="text-sm text-gray-600">{incident.report.recommendations || 'Aucune'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon name="Info" className="h-5 w-5 text-cyan-600" />
                  Synthèse rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 bg-slate-100/60 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Statut actuel</span>
                  <Badge className={`${statusClasses[incident.statut]} text-white w-fit`}>
                    {incident.statut}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 bg-slate-100/60 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Priorité</span>
                  <Badge className={`${priorityClasses[incident.priorite]} text-white w-fit`}>
                    {incident.priorite}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Type d'incident</span>
                  <span className="font-semibold text-gray-800 capitalize">{incident.type.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Service concerné</span>
                  <span className="font-semibold text-gray-800 uppercase">{incident.service}</span>
                </div>
                <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Localisation</span>
                  <span className="font-semibold text-gray-800">{incident.lieu}</span>
                </div>
                <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Signalé par</span>
                  <span className="font-semibold text-gray-800">{reportedByUserName}</span>
                </div>
                <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Assigné à</span>
                  <span className="font-semibold text-gray-800">
                    {incident.assigned_to ? (
                      <span className="inline-flex items-center gap-2">
                        <Icon name="UserCheck" className="h-4 w-4 text-cyan-600" />
                        {assignedUserName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Non assigné</span>
                    )}
                  </span>
                </div>
                {incident.prestataire && (
                  <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
                    <span className="text-xs uppercase tracking-wider text-gray-500">Prestataire</span>
                    <span className="font-semibold text-gray-800 inline-flex items-center gap-2">
                      <Icon name="Building2" className="h-4 w-4 text-purple-600" />
                      {incident.prestataire}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon name="Lightbulb" className="h-5 w-5 text-cyan-600" />
                  Conseils & actions à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  {incident.priorite === 'critique' && (
                    <li className="flex items-start gap-2">
                      <Icon name="AlertOctagon" className="h-5 w-5 text-red-500 mt-0.5" />
                      Prioriser une intervention immédiate pour réduire l'impact sur l'activité.
                    </li>
                  )}
                  {incident.statut === 'nouveau' && (
                    <li className="flex items-start gap-2">
                      <Icon name="ArrowRight" className="h-5 w-5 text-cyan-500 mt-0.5" />
                      Assigner rapidement un technicien et planifier une date d'intervention.
                    </li>
                  )}
                  {incident.statut === 'cours' && (
                    <li className="flex items-start gap-2">
                      <Icon name="Clock" className="h-5 w-5 text-orange-500 mt-0.5" />
                      Suivre l'avancement et mettre à jour le statut dès la fin des travaux.
                    </li>
                  )}
                  {incident.report?.recommendations && (
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCheck" className="h-5 w-5 text-green-500 mt-0.5" />
                      {incident.report.recommendations}
                    </li>
                  )}
                  {!incident.report?.recommendations && (
                    <li className="flex items-start gap-2">
                      <Icon name="Info" className="h-5 w-5 text-cyan-500 mt-0.5" />
                      Documenter toute action complémentaire et mettre à jour le rapport si nécessaire.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default IncidentDetailsPage;