import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import { Incident, IncidentPriority, IncidentStatus } from "@/types";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useFilterAndSearch } from "@/components/shared/SearchAndFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/Loading";

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

interface SecurityIncidentsTableProps {
  incidents: Incident[];
  allIncidents?: Incident[]; // Liste complète des incidents pour calculer le numéro séquentiel
  isLoading?: boolean;
}

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

export const SecurityIncidentsTable = ({ incidents, allIncidents = incidents, isLoading = false }: SecurityIncidentsTableProps) => {
  const securityIncidents = incidents.filter(i => i.service === 'securite');

  // Utilisation du hook de recherche et filtrage amélioré
  const { filteredData, searchQuery, setSearchQuery, filter, setFilter } = useFilterAndSearch(
    securityIncidents,
    ['type', 'lieu', 'description', 'id'],
    (incident, filterValue) => {
      if (filterValue === 'all') return true;
      if (filterValue === 'statut') return incident.statut === 'nouveau';
      return incident.priorite === filterValue || incident.statut === filterValue;
    }
  );

  const filterOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Critique', value: 'critique' },
    { label: 'Haute', value: 'haute' },
    { label: 'Moyenne', value: 'moyenne' },
    { label: 'Faible', value: 'faible' },
    { label: 'Non traités', value: 'statut' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="ListChecks" className="text-blue-600 mr-2" />
            Liste des Incidents de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Chargement des incidents..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="ListChecks" className="text-blue-600 mr-2" />
          Liste des Incidents de Sécurité
          <Badge variant="secondary" className="ml-2">{filteredData.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Barre de recherche et filtrage améliorée */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par type, lieu, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map(incident => (
              <TableRow key={incident.id}>
                <TableCell>
                  <Link to={`/incident/${incident.id}`} className="text-blue-600 hover:underline font-mono text-sm font-semibold">
                    {formatTicketNumber(incident, allIncidents)}
                  </Link>
                </TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>{incident.lieu}</TableCell>
                <TableCell><Badge className={`${priorityClasses[incident.priorite]} hover:${priorityClasses[incident.priorite]}`}>{incident.priorite}</Badge></TableCell>
                <TableCell><Badge className={`${statusClasses[incident.statut]} hover:${statusClasses[incident.statut]}`}>{incident.statut}</Badge></TableCell>
                <TableCell>{format(incident.date_creation, 'dd/MM/yyyy HH:mm')}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Icon name="Shield" className="mx-auto text-4xl text-gray-300 mb-2" />
                  {searchQuery || filter !== 'all' 
                    ? 'Aucun incident ne correspond à votre recherche.' 
                    : 'Aucun incident de sécurité à afficher.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};