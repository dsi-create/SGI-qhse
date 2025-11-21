import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/Icon";
import { IncidentType, IncidentPriority, IncidentService, UserRole, Users } from '@/types';
import { showError } from '@/utils/toast';

interface CreateTicketDialogProps {
  onCreateTicket: (ticket: {
    type: IncidentType;
    description: string;
    lieu: string;
    service: IncidentService;
    assignedTo: string;
    assigneeName?: string;
    priority: IncidentPriority;
    deadline: Date;
  }) => void;
  users: Users;
}

const getServiceFromRole = (role: UserRole): IncidentService | null => {
  switch (role) {
    case 'technicien':
      return 'technique';
    case 'technicien_polyvalent':
      return 'technique';
    case 'agent_entretien':
      return 'entretien';
    default:
      return null;
  }
};

export const CreateTicketDialog = ({ onCreateTicket, users }: CreateTicketDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<IncidentType>('autre');
  const [description, setDescription] = useState('');
  const [lieu, setLieu] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('moyenne');
  const [deadlineHours, setDeadlineHours] = useState('24');
  const [maintenanceAssignee, setMaintenanceAssignee] = useState<string>('');

  // Rôles autorisés pour l'assignation directe
  const allowedRoles: UserRole[] = ['technicien', 'technicien_polyvalent', 'agent_entretien'];

  const customUserDisplayNames: Record<string, string> = {
    technicien_polyvalent: 'Joachim',
    technicien: 'Teddy',
  };

  const availableUsers = useMemo(() => {
    return Object.entries(users)
      .filter(([, user]) => allowedRoles.includes(user.role))
      .map(([username, user]) => ({
        key: username,
        id: user.id,
        role: user.role,
        displayName: customUserDisplayNames[user.username] ||
          [user.first_name, user.last_name].filter(Boolean).join(' ') ||
          user.name ||
          user.username
      }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!selectedRole) return [];
    return availableUsers.filter(user => user.role === selectedRole);
  }, [availableUsers, selectedRole]);

  const selectedUser = useMemo(() => {
    return filteredUsers.find(u => u.id === assignedTo);
  }, [assignedTo, filteredUsers]);

  const maintenanceAgents = ['Stone', 'Paul', 'Edouard', 'Marina', 'Anne', 'Prisca', 'Jacque', 'Dorel', 'Christelle'];

  const handleSubmit = () => {
    if (!type || !description || !lieu || !priority || !deadlineHours) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!selectedRole) {
      showError("Veuillez sélectionner un type d'agent.");
      return;
    }

    if (!assignedTo || !selectedUser) {
      showError("Veuillez sélectionner un agent.");
      return;
    }

    const service = getServiceFromRole(selectedRole);
    if (!service) {
      showError("Erreur : service non valide pour ce rôle.");
      return;
    }

    if (selectedUser.role === 'agent_entretien' && !maintenanceAssignee) {
      showError("Veuillez sélectionner le nom de l'agent d'entretien.");
      return;
    }

    const deadline = new Date(Date.now() + parseInt(deadlineHours, 10) * 60 * 60 * 1000);
    const assigneeName = selectedRole === 'agent_entretien' 
      ? maintenanceAssignee 
      : selectedUser.displayName;

    onCreateTicket({
      type,
      description,
      lieu,
      service,
      assignedTo,
      assigneeName,
      priority,
      deadline
    });

    // Reset form
    setType('autre');
    setDescription('');
    setLieu('');
    setSelectedRole('');
    setAssignedTo('');
    setPriority('moyenne');
    setDeadlineHours('24');
    setMaintenanceAssignee('');
    setIsOpen(false);
  };

  const roleLabels: Partial<Record<UserRole, string>> = {
    technicien: 'Technicien Biomédical',
    technicien_polyvalent: 'Technicien Polyvalent',
    agent_entretien: 'Agent d\'Entretien',
  };

  const getRoleLabel = (role: UserRole) => roleLabels[role] || role;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
          <Icon name="Plus" className="mr-2 h-4 w-4" /> Créer un Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Icon name="Ticket" className="mr-2 h-5 w-5" />
            Créer un Ticket Directement
          </DialogTitle>
          <DialogDescription>
            Créez un ticket et assignez-le directement à un technicien biomédical, technicien polyvalent ou agent d'entretien.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type d'incident *</Label>
            <Select onValueChange={(v) => setType(v as IncidentType)} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technique">Technique</SelectItem>
                <SelectItem value="electrique">Électrique</SelectItem>
                <SelectItem value="plomberie">Plomberie</SelectItem>
                <SelectItem value="climatisation">Climatisation</SelectItem>
                <SelectItem value="equipement-medical">Équipement Médical</SelectItem>
                <SelectItem value="informatique">Informatique</SelectItem>
                <SelectItem value="maintenance-preventive">Maintenance Préventive</SelectItem>
                <SelectItem value="nettoyage">Nettoyage</SelectItem>
                <SelectItem value="sanitaire">Sanitaire</SelectItem>
                <SelectItem value="dechets">Déchets</SelectItem>
                <SelectItem value="hygiene">Hygiène</SelectItem>
                <SelectItem value="materiel">Matériel</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème ou la tâche à effectuer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lieu">Lieu *</Label>
            <Input
              id="lieu"
              placeholder="Ex: Bâtiment A, Étage 2, Bureau 205"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Type d'agent *</Label>
            <Select
              value={selectedRole || ''}
              onValueChange={(value) => {
                setSelectedRole(value as UserRole);
                setAssignedTo('');
                setMaintenanceAssignee('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir le type d'agent" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignedTo">Agent *</Label>
            <Select
              onValueChange={setAssignedTo}
              value={assignedTo}
              disabled={!selectedRole}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedRole ? "Sélectionner un agent" : "Choisir le type d'agent d'abord"} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <SelectItem key={user.key} value={user.id}>
                      {user.displayName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {selectedRole ? "Aucun agent disponible pour ce rôle." : "Sélectionnez un type d'agent."}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'agent_entretien' && (
            <div className="grid gap-2">
              <Label htmlFor="maintenanceAgent">Nom de l'agent d'entretien *</Label>
              <Select onValueChange={setMaintenanceAssignee} value={maintenanceAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le nom de l'agent" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceAgents.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="priority">Priorité *</Label>
            <Select onValueChange={(v) => setPriority(v as IncidentPriority)} value={priority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faible">🟢 Faible</SelectItem>
                <SelectItem value="moyenne">🟡 Moyenne</SelectItem>
                <SelectItem value="haute">🟠 Haute</SelectItem>
                <SelectItem value="critique">🔴 Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Délai (heures) *</Label>
            <Input
              id="deadline"
              type="number"
              min="1"
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(e.target.value)}
              placeholder="24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            <Icon name="Check" className="mr-2 h-4 w-4" /> Créer et Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

