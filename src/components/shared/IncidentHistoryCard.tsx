import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { Incident, IncidentStatus, IncidentService } from "@/types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface IncidentHistoryCardProps {
  title: string;
  subtitle?: string;
  incidents: Incident[];
  allIncidents?: Incident[]; // Liste complète des incidents pour calculer le numéro séquentiel
  emptyMessage: string;
  onDelete?: (incidentId: string) => void;
  footerAction?: React.ReactNode;
}

const statusLabel = (status: IncidentStatus) => {
  switch (status) {
    case "nouveau":
      return { label: "Nouveau", className: "bg-blue-500" };
    case "attente":
      return { label: "En attente", className: "bg-orange-500" };
    case "cours":
      return { label: "En cours", className: "bg-yellow-500" };
    case "traite":
      return { label: "Traité", className: "bg-teal-500" };
    case "resolu":
    default:
      return { label: "Résolu", className: "bg-green-500" };
  }
};

const priorityColor = (priority: Incident["priorite"] | undefined | null) => {
  if (!priority) return "bg-gray-400";
  switch (priority) {
    case "critique":
      return "bg-red-600";
    case "haute":
      return "bg-orange-600";
    case "moyenne":
      return "bg-yellow-500";
    case "faible":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

const priorityLabel = (priority: Incident["priorite"] | undefined | null) => {
  if (!priority) return "Non définie";
  switch (priority) {
    case "critique":
      return "Critique";
    case "haute":
      return "Haute";
    case "moyenne":
      return "Moyenne";
    case "faible":
      return "Faible";
    default:
      return priority || "Non définie";
  }
};

const serviceInfo = (service: IncidentService) => {
  switch (service) {
    case "entretien":
      return { 
        label: "Entretien", 
        className: "bg-green-100 text-green-700 border-green-200",
        icon: "SprayCan" as const
      };
    case "securite":
      return { 
        label: "Sécurité", 
        className: "bg-indigo-100 text-indigo-700 border-indigo-200",
        icon: "Shield" as const
      };
    case "biomedical":
      return { 
        label: "Biomédical", 
        className: "bg-teal-100 text-teal-700 border-teal-200",
        icon: "HeartPulse" as const
      };
    case "technique":
      return { 
        label: "Technique", 
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "Wrench" as const
      };
    default:
      return { 
        label: "Autre", 
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: "AlertCircle" as const
      };
  }
};

const statusOrder: IncidentStatus[] = ["nouveau", "attente", "cours", "traite", "resolu"];

// Fonction pour obtenir le préfixe du service
const getServicePrefix = (service: IncidentService): string => {
  switch (service) {
    case 'securite':
      return 'secu';
    case 'entretien':
      return 'ent';
    case 'biomedical':
      return 'bio';
    case 'technique':
      return 'tech';
    default:
      return 'inc';
  }
};

// Fonction pour formater le numéro de ticket de manière séquentielle
const formatTicketNumber = (incident: Incident, allIncidents: Incident[] = []): string => {
  if (!allIncidents || allIncidents.length === 0) {
    // Fallback si allIncidents n'est pas disponible
    const cleanId = incident.id.replace(/-/g, '').toUpperCase();
    return `${getServicePrefix(incident.service)}-${cleanId.slice(-6)}`;
  }
  
  const prefix = getServicePrefix(incident.service);
  // Trier tous les incidents du même service par date de création
  const serviceIncidents = allIncidents
    .filter(i => i.service === incident.service)
    .sort((a, b) => {
      const dateA = typeof a.date_creation === 'string' ? new Date(a.date_creation) : a.date_creation;
      const dateB = typeof b.date_creation === 'string' ? new Date(b.date_creation) : b.date_creation;
      return dateA.getTime() - dateB.getTime();
    });
  
  // Trouver l'index de l'incident actuel + 1 (pour commencer à 1)
  const index = serviceIncidents.findIndex(i => i.id === incident.id) + 1;
  
  return `${prefix}-${index}`;
};

export const IncidentHistoryCard = ({
  title,
  subtitle,
  incidents,
  allIncidents = incidents, // Par défaut, utiliser la liste fournie
  emptyMessage,
  onDelete,
  footerAction,
}: IncidentHistoryCardProps) => {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon name="Clock" className="text-cyan-600 h-5 w-5" />
          {title}
        </CardTitle>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <Icon name="Info" className="text-cyan-500 h-4 w-4" />
            {emptyMessage}
          </div>
        ) : (
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Type / Description</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Détails</TableHead>
                  {onDelete && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
            <TableBody>
              {incidents.map((incident) => {
                const status = statusLabel(incident.statut);
                const service = serviceInfo(incident.service);
                  const handleDelete = () => {
                    if (!onDelete) return;
                    const confirmDelete = window.confirm(
                      "Voulez-vous vraiment supprimer cette déclaration ?"
                    );
                    if (confirmDelete) {
                      onDelete(incident.id);
                    }
                  };

                return (
                  <TableRow key={incident.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {formatTicketNumber(incident, allIncidents)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${service.className} border flex items-center gap-1.5 px-2 py-1`}
                      >
                        <Icon name={service.icon} className="h-3.5 w-3.5" />
                        {service.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-800 capitalize">
                        {incident.type.replace(/-/g, " ")}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">
                        {incident.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {incident.lieu}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${priorityColor(incident.priorite)} text-white font-semibold`}>
                        {priorityLabel(incident.priorite)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.className} text-white`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(
                        typeof incident.date_creation === "string"
                          ? new Date(incident.date_creation)
                          : incident.date_creation,
                        "dd MMM yyyy",
                        { locale: fr }
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {statusOrder.map((step, idx) => (
                          <div key={step} className="flex items-center gap-1">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                statusOrder.indexOf(incident.statut) >= idx ? 'bg-teal-500' : 'bg-slate-300'
                              }`}
                            />
                            {idx < statusOrder.length - 1 && (
                              <div
                                className={`w-6 h-0.5 ${
                                  statusOrder.indexOf(incident.statut) > idx ? 'bg-teal-400' : 'bg-slate-200'
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/incident/${incident.id}`}
                        className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                      >
                        <Icon name="ExternalLink" className="h-4 w-4" />
                        Voir
                      </Link>
                    </TableCell>
                    {onDelete && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleDelete}
                        >
                          <Icon name="Trash" className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {footerAction && <CardContent className="border-t border-slate-100 pt-3">{footerAction}</CardContent>}
    </Card>
  );
};

