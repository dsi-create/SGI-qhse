import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import { MaintenanceTask, MaintenanceTaskStatus, MaintenanceTaskType, BiomedicalEquipment } from "@/types";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusClasses: Record<MaintenanceTaskStatus, string> = {
  planifiée: "bg-blue-500",
  en_cours: "bg-yellow-500",
  terminée: "bg-green-500",
  annulée: "bg-gray-500",
};

const typeClasses: Record<MaintenanceTaskType, string> = {
  préventive: "border-green-500 text-green-500",
  curative: "border-red-500 text-red-500",
};

interface MaintenanceScheduleProps {
  tasks: MaintenanceTask[];
  equipment: BiomedicalEquipment[];
  onUpdateStatus: (taskId: string, status: MaintenanceTaskStatus) => void;
}

export const MaintenanceSchedule = ({ tasks, equipment, onUpdateStatus }: MaintenanceScheduleProps) => {
  const getEquipmentName = (id: string) => equipment.find(e => e.id === id)?.name || 'Inconnu';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Calendar" className="text-cyan-600 mr-2" />
          Plan de Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Équipement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Planifiée</TableHead>
              <TableHead>Commentaires</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-gray-500">
                  Aucune tâche de maintenance planifiée pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{getEquipmentName(task.equipment_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeClasses[task.type]}>{task.type}</Badge>
                  </TableCell>
                  <TableCell>{format(task.scheduled_date, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="max-w-xs">
                    {task.comments ? (
                      <span className="text-sm text-gray-600 whitespace-pre-wrap">{task.comments}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="w-40">
                    <Select value={task.status} onValueChange={(status) => onUpdateStatus(task.id, status as MaintenanceTaskStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planifiée">Planifiée</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="terminée">Terminée</SelectItem>
                        <SelectItem value="annulée">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};