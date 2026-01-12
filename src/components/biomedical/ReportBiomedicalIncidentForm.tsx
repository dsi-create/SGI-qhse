import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/Icon";
import { locations } from "@/lib/locations";
import { medicalEquipmentList } from "@/lib/equipmentList";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Incident, IncidentPriority, IncidentType } from "@/types";
import { showError } from "@/utils/toast";

interface ReportBiomedicalIncidentFormProps {
  onAddIncident: (incident: Omit<Incident, 'id' | 'date_creation' | 'reported_by' | 'photo_urls'>, files: File[]) => void;
}

const issueTypes: { value: IncidentType; label: string }[] = [
  { value: 'equipement-medical', label: 'Défaut équipement médical' },
  { value: 'maintenance-preventive', label: 'Demande de maintenance préventive' },
  { value: 'informatique', label: 'Problème logiciel / interface' },
  { value: 'technique', label: 'Panne technique / électricité' },
  { value: 'autre', label: 'Autre' },
];

export const ReportBiomedicalIncidentForm = ({ onAddIncident }: ReportBiomedicalIncidentFormProps) => {
  const [issueType, setIssueType] = useState<IncidentType>('equipement-medical');
  const [equipment, setEquipment] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('moyenne');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!equipment || !location || !description) {
      showError("Merci de renseigner l'équipement, le lieu et la description.");
      return;
    }

    const baseDescription = description.trim();
    const composedDescription = [
      `Équipement concerné : ${equipment}`,
      serialNumber ? `Numéro de série / ID : ${serialNumber}` : null,
      baseDescription ? `Description : ${baseDescription}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Debug: vérifier la priorité avant envoi
    console.log('ReportBiomedicalIncidentForm - Priorité sélectionnée:', priority, 'type:', typeof priority);
    
    onAddIncident(
      {
        type: issueType,
        lieu: location,
        priorite: priority,
        description: composedDescription || baseDescription,
        statut: 'nouveau',
        service: 'biomedical',
      } as Omit<Incident, 'id' | 'date_creation' | 'reported_by' | 'photo_urls'>,
      photos
    );

    setIssueType('equipement-medical');
    setEquipment('');
    setSerialNumber('');
    setLocation('');
    setPriority('moyenne');
    setDescription('');
    setPhotos([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="AlertTriangle" className="text-cyan-600 mr-2" />
          Déclarer un Équipement Défectueux
        </CardTitle>
        <CardDescription>
          Ce formulaire transmet automatiquement la demande au service biomédical pour prise en charge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'incident</label>
              <Select value={issueType} onValueChange={(value) => setIssueType(value as IncidentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
              <Select value={priority} onValueChange={(value) => setPriority(value as IncidentPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Définir la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">🟢 Faible</SelectItem>
                  <SelectItem value="moyenne">🟡 Moyenne</SelectItem>
                  <SelectItem value="haute">🟠 Haute</SelectItem>
                  <SelectItem value="critique">🔴 Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Équipement concerné</label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'équipement" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {medicalEquipmentList.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de série / ID (optionnel)</label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Ex : SN-12345 / IMM-4589" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation de l'équipement</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un lieu" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez la panne, les symptômes observés et l'impact sur l'activité..."
              rows={5}
            />
          </div>

          <ImageUpload onFilesChange={setPhotos} />

          <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700">
            <Icon name="Send" className="mr-2 h-4 w-4" />
            Envoyer au service biomédical
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportBiomedicalIncidentForm;

