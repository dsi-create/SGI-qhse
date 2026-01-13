import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/Icon";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiClient } from "@/integrations/api/client";
import { showError } from "@/utils/toast";

interface LoginHistoryEntry {
  id: string;
  user_id: string;
  username: string;
  email: string;
  role: string;
  ip_address: string;
  user_agent: string;
  login_time: string;
  logout_time: string | null;
  session_duration: number | null;
  status: 'success' | 'failed' | 'expired';
  failure_reason: string | null;
  first_name: string | null;
  last_name: string | null;
  service: string | null;
}

interface LoginHistoryTableProps {
  users?: { [key: string]: any };
}

export const LoginHistoryTable = ({ users }: LoginHistoryTableProps) => {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  
  // Filtres
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      const params: any = { limit, offset };
      if (selectedUserId && selectedUserId !== 'all') params.userId = selectedUserId;
      if (selectedRole && selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await apiClient.getLoginHistory(params);
      setLoginHistory(data.loginHistory || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('Erreur:', error);
      showError(error.message || 'Erreur lors de la récupération de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, [limit, offset, selectedUserId, selectedRole, selectedStatus, startDate, endDate]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Succès</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Échec</Badge>;
      case 'expired':
        return <Badge className="bg-orange-500">Expiré</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredHistory = loginHistory.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.username?.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.ip_address?.toLowerCase().includes(query) ||
      entry.role?.toLowerCase().includes(query) ||
      `${entry.first_name} ${entry.last_name}`.toLowerCase().includes(query)
    );
  });

  const uniqueRoles = Array.from(new Set(loginHistory.map(e => e.role))).filter(Boolean).sort();
  const userList = users ? Object.values(users) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="History" className="mr-2 h-6 w-6" />
          Historique des Connexions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="col-span-full md:col-span-2"
          />
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              {userList.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {uniqueRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="success">Succès</SelectItem>
              <SelectItem value="failed">Échec</SelectItem>
              <SelectItem value="expired">Expiré</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Date début"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Date fin"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Chargement de l'historique...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Inbox" className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun historique de connexion trouvé</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Heure</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Durée Session</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Raison Échec</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(entry.login_time), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                          </div>
                          {entry.logout_time && (
                            <div className="text-xs text-gray-500">
                              Déco: {format(new Date(entry.logout_time), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {entry.first_name && entry.last_name
                              ? `${entry.first_name} ${entry.last_name}`
                              : entry.username}
                          </div>
                          <div className="text-xs text-gray-500">{entry.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.role}</Badge>
                      </TableCell>
                      <TableCell>{entry.service || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.ip_address}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>{formatDuration(entry.session_duration)}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs" title={entry.user_agent}>
                        {entry.user_agent}
                      </TableCell>
                      <TableCell className="text-red-600 text-xs">
                        {entry.failure_reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Affichage de {offset + 1} à {Math.min(offset + limit, total)} sur {total} entrées
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  <Icon name="ChevronLeft" className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                >
                  Suivant
                  <Icon name="ChevronRight" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

