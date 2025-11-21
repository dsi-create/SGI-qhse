import availabilityGrid from "@/data/consultationSchedule.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface AvailabilitySlot {
  start: string;
  end: string;
  room: string;
  shortRoom: string;
  specialty: string;
  doctor: string;
  location?: string;
}

interface DayAvailability {
  day: string;
  slots: AvailabilitySlot[];
}

const typedAvailability = availabilityGrid as DayAvailability[];

const normalizeDay = (day: string) =>
  day.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const formatTimeRange = (start: string, end: string) => `${start} – ${end}`;

interface ConsultationAvailabilityProps {
  selectedDay?: string;
  onSelectDay?: (day: string) => void;
}

export const ConsultationAvailability = ({ selectedDay, onSelectDay }: ConsultationAvailabilityProps) => {
  const normalizedSelected = selectedDay ? normalizeDay(selectedDay) : null;

  const daysToDisplay = normalizedSelected
    ? typedAvailability.filter((dayBlock) => normalizeDay(dayBlock.day) === normalizedSelected)
    : typedAvailability;

  return (
    <Card className="border border-cyan-100 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon name="CalendarDays" className="text-cyan-600" />
          Grille de disponibilité des consultations
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {typedAvailability.map((dayBlock) => {
            const isActive = normalizeDay(dayBlock.day) === normalizedSelected;
            return (
              <button
                key={dayBlock.day}
                type="button"
                onClick={() => onSelectDay?.(dayBlock.day)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-md focus-visible:ring-cyan-400"
                    : "border-cyan-200 bg-white text-gray-600 hover:bg-cyan-50 focus-visible:ring-cyan-300"
                )}
              >
                {dayBlock.day}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {daysToDisplay.length === 0 && (
          <div className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-6 text-center text-sm text-gray-600">
            Aucune plage de consultation définie pour ce jour.
          </div>
        )}
        {daysToDisplay.map((dayBlock) => (
          <div key={dayBlock.day} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="Clock" className="h-4 w-4 text-cyan-500" />
              <h3 className="text-base font-semibold uppercase tracking-wide text-gray-800">
                {dayBlock.day}
              </h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-cyan-100 bg-white">
              <table className="min-w-full divide-y divide-cyan-100 text-sm">
                <thead className="bg-cyan-50/60">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Horaire</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Salle</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Spécialité</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Médecin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-50">
                  {dayBlock.slots.map((slot, index) => (
                    <tr key={`${dayBlock.day}-${index}`} className="transition-colors hover:bg-cyan-50/70">
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {formatTimeRange(slot.start, slot.end)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-800">
                        {slot.shortRoom}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-600">{slot.specialty}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-600">{slot.doctor || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

