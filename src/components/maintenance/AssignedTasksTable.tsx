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

const statusClasses: Record<IncidentStatus, string> = {
  nouveau: "bg-blue-500",
  cours: "bg-yellow-500",
  traite: "bg-teal-500",
  resolu: "bg-green-500",
  attente: "bg-gray-500",
};

interface AssignedTasksTableProps {
  incidents: Incident[];
  allIncidents?: Incident[]; // Liste complète des incidents pour calculer le numéro séquentiel
  onUpdateIncidentStatus: (incidentId: string, newStatus: IncidentStatus) => void;
}

const AssignedTasksTable = ({ incidents, allIncidents = incidents, onUpdateIncidentStatus }: AssignedTasksTableProps) => {
  const tasks = incidents.filter(i => i.service === 'entretien');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="ClipboardList" className="text-blue-600 mr-2" />
          Mes Tâches Assignées
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
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? tasks.map(task => (
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
                  <Badge className={`${statusClasses[task.statut]} hover:${statusClasses[task.statut]}`}>
                    {task.statut}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 transition-transform hover:scale-105"
                      onClick={() => onUpdateIncidentStatus(task.id, 'cours')}
                      disabled={task.statut === 'cours' || task.statut === 'traite' || task.statut === 'resolu'}
                    >
                      <Icon name="Play" className="mr-1 h-4 w-4" /> Démarrer
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transition-transform hover:scale-105"
                      onClick={() => onUpdateIncidentStatus(task.id, 'traite')}
                      disabled={task.statut !== 'cours'}
                    >
                      <Icon name="Check" className="mr-1 h-4 w-4" /> Terminer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Icon name="ClipboardCheck" className="mx-auto text-4xl text-gray-300 mb-2" />
                  Aucune tâche assignée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AssignedTasksTable;