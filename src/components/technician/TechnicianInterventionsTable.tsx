import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@/components/Icon";
import { Incident, IncidentPriority, IncidentStatus, IncidentService } from "@/types";

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

const priorityClasses: Record<IncidentPriority, string> = {
  faible: "bg-green-500",
  moyenne: "bg-yellow-500",
  haute: "bg-orange-600",
  critique: "bg-red-600",
};

interface TechnicianInterventionsTableProps {
  interventions: Incident[];
  allIncidents?: Incident[]; // Liste complète des incidents pour calculer le numéro séquentiel
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onOpenReportDialog: (incident: Incident) => void;
}

export const TechnicianInterventionsTable = ({ interventions, allIncidents = interventions, onUpdateStatus, onOpenReportDialog }: TechnicianInterventionsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Wrench" className="text-orange-600 mr-2" />
          Mes Interventions Techniques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions.length > 0 ? interventions.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-sm font-semibold">{formatTicketNumber(task, allIncidents)}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>{task.lieu}</TableCell>
                <TableCell>
                  <Badge className={`${priorityClasses[task.priorite]} hover:${priorityClasses[task.priorite]}`}>
                    {task.priorite}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 transition-transform hover:scale-105"
                      onClick={() => onUpdateStatus(task.id, 'cours')}
                      disabled={task.statut === 'cours' || task.statut === 'traite'}
                    >
                      <Icon name="Play" className="mr-1 h-4 w-4" /> Démarrer
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transition-transform hover:scale-105"
                      onClick={() => onOpenReportDialog(task)}
                      disabled={task.statut !== 'cours'}
                    >
                      <Icon name="ClipboardCheck" className="mr-1 h-4 w-4" /> Rapport
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Icon name="ClipboardCheck" className="mx-auto text-4xl text-gray-300 mb-2" />
                  Aucune intervention assignée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};