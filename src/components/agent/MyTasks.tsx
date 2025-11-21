import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/Icon";
import { PlannedTask, PlannedTaskStatus, Users } from "@/types";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal } from "lucide-react";

interface MyTasksProps {
  tasks: PlannedTask[];
  users: Users;
  onUpdateStatus: (taskId: string, status: PlannedTaskStatus) => void;
}

const statusConfigs: Record<PlannedTaskStatus, { label: string; className: string }> = {
  'à faire': { label: 'Pas commencé', className: 'bg-gray-500' },
  'en_cours': { label: 'En cours', className: 'bg-amber-500' },
  'terminée': { label: 'Terminé', className: 'bg-green-600' },
  'annulée': { label: 'Bloqué', className: 'bg-red-600' },
};

export const MyTasks = ({ tasks, users, onUpdateStatus }: MyTasksProps) => {
  const findUserName = (userId: string) => {
    const userEntry = Object.values(users).find(user => user.id === userId);
    if (!userEntry) {
      return 'Agent inconnu';
    }
    const parts = [userEntry.first_name, userEntry.last_name].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (userEntry.name) {
      return userEntry.name;
    }
    return userEntry.username;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="ClipboardList" className="text-blue-600 mr-2" />
          Mes Tâches Planifiées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? tasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="text-sm text-gray-600 max-w-sm truncate">{task.description}</TableCell>
                <TableCell>{task.assignee_name || findUserName(task.assigned_to)}</TableCell>
                <TableCell>{format(task.due_date, 'PPP', { locale: fr })}</TableCell>
                <TableCell>
                  {(() => {
                    const statusInfo = statusConfigs[task.status] ?? { label: task.status, className: 'bg-gray-400' };
                    return (
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={task.status === 'terminé'}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'en_cours')} disabled={task.status === 'en_cours'}>
                        <Icon name="Play" className="mr-2 h-4 w-4" /> Démarrer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'terminée')}>
                        <Icon name="Check" className="mr-2 h-4 w-4" /> Terminer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'annulée')} className="text-red-600">
                        <Icon name="AlertTriangle" className="mr-2 h-4 w-4" /> Bloquer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Icon name="ClipboardCheck" className="mx-auto text-4xl text-gray-300 mb-2" />
                  Aucune tâche planifiée pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};