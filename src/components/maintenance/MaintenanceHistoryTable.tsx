import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@/components/Icon";
import { Incident, IncidentService } from "@/types";
import { format } from 'date-fns';

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

interface MaintenanceHistoryTableProps {
  interventions: Incident[];
  allIncidents?: Incident[]; // Liste complète des incidents pour calculer le numéro séquentiel
}

export const MaintenanceHistoryTable = ({ interventions, allIncidents = interventions }: MaintenanceHistoryTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="History" className="text-gray-600 mr-2" />
          Historique de mes Tâches d'Entretien
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions.length > 0 ? interventions.map(task => (
              <TableRow key={task.id}>
                <TableCell>{format(task.report?.report_date || task.date_creation, 'dd/MM/yyyy')}</TableCell>
                <TableCell className="font-mono text-sm font-semibold">{formatTicketNumber(task, allIncidents)}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>{task.lieu}</TableCell>
                <TableCell>{task.statut}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Icon name="History" className="mx-auto text-4xl text-gray-300 mb-2" />
                  Aucun historique de tâche
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};