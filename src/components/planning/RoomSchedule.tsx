import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/Icon';
import { Room, Booking, User, UserRole, Doctor, Civility } from '@/types';
import { format, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddBookingDialog } from './AddBookingDialog';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RoomScheduleMatrix } from './RoomScheduleMatrix';
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { generateBookingReportPDF } from '@/utils/bookingPdfGenerator';
import { showError, showSuccess } from '@/utils/toast';
import { EditBookingDialog } from './EditBookingDialog';
import { cn } from '@/lib/utils';
import { canManageBookings } from '@/lib/permissions';
import { ConsultationAvailability } from './ConsultationAvailability';
import availabilityGrid from '@/data/consultationSchedule.json';
import { RoomScheduleCalendar } from './RoomScheduleCalendar';

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

const availabilityData = availabilityGrid as DayAvailability[];

const normalizeDay = (day: string) =>
  day.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const capitalize = (value: string) =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

const parseTimeToDate = (baseDate: Date, time: string) => {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const normalizeDoctorLabel = (label: string) =>
  label.trim().replace(/^dr[\.\s]*/i, '').toLowerCase();

const dayNameToIndex: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

const getAlignedDateForDay = (referenceDate: Date, targetDay: string) => {
  const targetIndex = dayNameToIndex[normalizeDay(targetDay)];
  if (targetIndex === undefined) {
    return referenceDate;
  }
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const aligned = new Date(weekStart);
  const offset = targetIndex === 0 ? -1 : targetIndex - 1;
  aligned.setDate(weekStart.getDate() + offset);
  return aligned;
};

const fallbackRooms = Array.from(
  availabilityData
    .reduce((map, day) => {
      day.slots.forEach((slot) => {
        if (!map.has(slot.room)) {
          map.set(slot.room, {
            id: `fallback-${map.size + 1}`,
            name: slot.room,
            location: slot.location ?? slot.shortRoom,
            doctor_in_charge: slot.doctor || undefined,
            created_at: new Date(),
          } as Room);
        }
      });
      return map;
    }, new Map<string, Room>())
    .values()
);

interface RoomScheduleProps {
  rooms: Room[];
  bookings: Booking[];
  users: { [username: string]: User };
  doctors: Doctor[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'booked_by' | 'status' | 'created_at'>) => void;
  updateBooking: (bookingId: string, updatedData: Omit<Booking, 'id' | 'booked_by' | 'created_at'>) => void;
  deleteBooking: (bookingId: string) => void;
  currentUserRole: UserRole;
  currentUser: User;
  currentUsername: string; // Added currentUsername prop
  expiringBookingIds: Set<string>;
  preExpiringBookingIds: Set<string>;
  onStartBooking: (bookingId: string, pin: string) => Promise<boolean>;
  onEndBooking: (bookingId: string) => void;
}

export const RoomSchedule = ({ rooms, bookings, users, doctors, onAddBooking, updateBooking, deleteBooking, currentUserRole, currentUser, currentUsername, expiringBookingIds, preExpiringBookingIds, onStartBooking, onEndBooking }: RoomScheduleProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'calendar'>('calendar');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBookingInfo, setNewBookingInfo] = useState<{ roomId: string; startTime: Date; endTime?: Date; doctorId?: string; title?: string } | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const dayName = format(new Date(), 'EEEE', { locale: fr });
    const normalized = normalizeDay(dayName);
    const availability = availabilityData.find((day) => normalizeDay(day.day) === normalized);
    return availability ? availability.day : availabilityData[0]?.day ?? 'Lundi';
  });

  const dayAvailability = useMemo(
    () => availabilityData.find((day) => normalizeDay(day.day) === normalizeDay(selectedDay)),
    [selectedDay]
  );

  const roomsToDisplay = useMemo(() => {
    if (rooms.length > 0) {
      return rooms;
    }
    if (!dayAvailability) {
      return fallbackRooms;
    }
    const roomNames = Array.from(new Set(dayAvailability.slots.map((slot) => slot.room)));
    return fallbackRooms.filter((room) => roomNames.includes(room.name));
  }, [rooms, dayAvailability]);

  const hasRealRooms = rooms.length > 0;
  const formattedSelectedDate = capitalize(
    format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
  );
  const scheduledSlotsCount = dayAvailability?.slots.length ?? 0;

  const dailyBookings = bookings.filter(b => format(b.start_time, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));

  useEffect(() => {
    const dayName = format(selectedDate, 'EEEE', { locale: fr });
    const availability = availabilityData.find((day) => normalizeDay(day.day) === normalizeDay(dayName));
    if (availability && availability.day !== selectedDay) {
      setSelectedDay(availability.day);
    }
  }, [selectedDate, selectedDay]);

  const handleSelectDay = (day: string) => {
    setSelectedDay(day);
    setSelectedDate((prev) => getAlignedDateForDay(prev, day));
  };

  const handleSelectSlot = (roomId: string, startTime: Date) => {
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    setNewBookingInfo({ roomId, startTime, endTime });
    setIsAddDialogOpen(true);
  };

  const handleCreateFromReferenceSlot = (slot: AvailabilitySlot) => {
    if (!canManageBookings(currentUserRole)) {
      showError("Seule la secrétaire peut planifier ce créneau.");
      return;
    }

    if (!hasRealRooms) {
      showError("Aucune salle n'est encore synchronisée. Veuillez patienter.");
      return;
    }

    const targetRoom =
      rooms.find((room) => room.name === slot.room) ||
      rooms.find((room) => room.name.includes(slot.shortRoom)) ||
      rooms.find((room) => room.location === slot.location);

    if (!targetRoom) {
      showError(`Salle introuvable pour le créneau ${slot.shortRoom}.`);
      return;
    }

    const alignedDate = getAlignedDateForDay(selectedDate, selectedDay);
    const start = parseTimeToDate(alignedDate, slot.start);
    const end = parseTimeToDate(alignedDate, slot.end);

    const doctor = slot.doctor
      ? doctors.find(
          (doc) => normalizeDoctorLabel(doc.name) === normalizeDoctorLabel(slot.doctor),
        )
      : undefined;

    setNewBookingInfo({
      roomId: targetRoom.id,
      startTime: start,
      endTime: end,
      doctorId: doctor?.id,
      title: slot.specialty,
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteBooking = (bookingId: string) => {
    deleteBooking(bookingId);
    setSelectedBooking(null);
  };

  const handleOpenEditDialog = () => {
    setBookingToEdit(selectedBooking);
    setSelectedBooking(null);
  };

  const handleGenerateReport = async () => {
    await generateBookingReportPDF(dailyBookings, roomsToDisplay, users, selectedDate);
    showSuccess("Le rapport PDF a été généré avec succès.");
  };

  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.filter(booking =>
      booking.room_id === roomId &&
      format(booking.start_time, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
  };

  const isRoomOccupiedNow = (roomId: string) => {
    const now = new Date();
    if (format(selectedDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) {
      return null;
    }
    const todaysBookings = getBookingsForRoomAndDate(roomId, now);
    return todaysBookings.some(booking => now >= booking.start_time && now < booking.end_time);
  };

  const selectedBookingUser = useMemo(() => {
    if (!selectedBooking) return undefined;
    const found = Object.values(users).find(u => u.id === selectedBooking.booked_by);
    if (found) return found;
    return {
      id: selectedBooking.booked_by,
      username: 'inconnu',
      first_name: 'Utilisateur',
      last_name: 'Inconnu',
      name: 'Utilisateur inconnu',
      civility: 'M.' as Civility,
      email: '',
      position: '',
      role: 'secretaire',
    } as User;
  }, [selectedBooking, users]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Icon name="Calendar" className="text-blue-600 mr-2" />
          Planning des Salles
        </CardTitle>
        <div className="flex items-center space-x-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: 'list' | 'matrix' | 'calendar') => value && setViewMode(value)}
            className="grid grid-cols-3 gap-1 rounded-full bg-cyan-50 p-1"
          >
            <ToggleGroupItem value="calendar" aria-label="Vue calendrier" className="rounded-full data-[state=on]:bg-white data-[state=on]:shadow">
              <Icon name="CalendarRange" className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="matrix" aria-label="Vue matrice" className="rounded-full data-[state=on]:bg-white data-[state=on]:shadow">
              <Icon name="LayoutGrid" className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vue liste" className="rounded-full data-[state=on]:bg-white data-[state=on]:shadow">
              <Icon name="List" className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          {canManageBookings(currentUserRole) && (
            <>
              <Button variant="outline" onClick={handleGenerateReport}>
                <Icon name="Download" className="mr-2 h-4 w-4" /> Rapport
              </Button>
              <Button
                onClick={() => { setNewBookingInfo(undefined); setIsAddDialogOpen(true); }}
                disabled={!hasRealRooms}
              >
                <Icon name="Plus" className="mr-2 h-4 w-4" /> Réserver
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 rounded-xl border border-cyan-50 bg-cyan-50/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Info" className="h-4 w-4 text-cyan-600" />
            <p className="text-sm text-gray-700">
              Consultez la grille de référence ou changez de vue pour visualiser l’occupation réelle.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReference(prev => !prev)}
          >
            <Icon name={showReference ? "EyeOff" : "Eye"} className="mr-2 h-4 w-4" />
            {showReference ? "Masquer la grille" : "Afficher la grille"}
          </Button>
        </div>

        {showReference && (
          <ConsultationAvailability selectedDay={selectedDay} onSelectDay={handleSelectDay} />
        )}

        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-cyan-50 bg-cyan-50/30 px-4 py-3 sm:flex-row">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 1);
            return newDate;
              })}
            >
            <Icon name="ChevronLeft" className="h-4 w-4" />
          </Button>
            <h3 className="min-w-[260px] text-center text-lg font-semibold">
              {formattedSelectedDate}
            </h3>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 1);
            return newDate;
              })}
            >
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Button>
          </div>
          <div className="text-sm text-gray-600 text-center sm:text-right">
            {roomsToDisplay.length} salle{roomsToDisplay.length > 1 ? 's' : ''} référencée{roomsToDisplay.length > 1 ? 's' : ''} •{" "}
            {scheduledSlotsCount} consultation{scheduledSlotsCount > 1 ? 's' : ''} prévue{scheduledSlotsCount > 1 ? 's' : ''}
          </div>
        </div>

        {!hasRealRooms && (
          <div className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-4 text-sm text-gray-600">
            La synchronisation des salles de consultation est en cours. Les créneaux remontés depuis la grille sont affichés
            automatiquement et seront éditables dès que les réservations auront été enregistrées.
          </div>
        )}

        {viewMode === 'calendar' ? (
          <RoomScheduleCalendar
            bookings={bookings}
            rooms={roomsToDisplay}
            users={users}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSelectBooking={setSelectedBooking}
            totalRooms={roomsToDisplay.length}
            fallbackSlots={dayAvailability?.slots}
            hasRealRooms={hasRealRooms}
            canManageBookings={canManageBookings(currentUserRole)}
            onCreateSlot={canManageBookings(currentUserRole) ? handleCreateFromReferenceSlot : undefined}
          />
        ) : viewMode === 'matrix' ? (
          <RoomScheduleMatrix
            rooms={roomsToDisplay}
            bookings={dailyBookings}
            users={users}
            doctors={doctors}
            selectedDate={selectedDate}
            onSelectSlot={canManageBookings(currentUserRole) && hasRealRooms ? handleSelectSlot : undefined}
            onSelectBooking={setSelectedBooking}
            expiringBookingIds={expiringBookingIds}
            preExpiringBookingIds={preExpiringBookingIds}
          />
        ) : (
          <div className="space-y-6">
            {roomsToDisplay.map(room => {
              const isOccupied = isRoomOccupiedNow(room.id);
              return (
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{room.name}</h4>
                      <p className="text-sm text-gray-500">{room.location}{room.doctor_in_charge && ` - ${room.doctor_in_charge}`}</p>
                    </div>
                    {isOccupied !== null && (
                      <Badge variant={isOccupied ? "destructive" : "default"} className={!isOccupied ? "bg-green-500" : ""}>
                        {isOccupied ? "Occupé" : "Libre"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 mt-3">
                    {getBookingsForRoomAndDate(room.id, selectedDate).length > 0 ? (
                      getBookingsForRoomAndDate(room.id, selectedDate).map(booking => (
                        <div
                          key={booking.id}
                          className={cn(
                            "p-3 rounded-r-md flex justify-between items-center group transition-transform hover:scale-[1.02] cursor-pointer",
                            expiringBookingIds.has(booking.id)
                              ? 'bg-red-100 border-l-4 border-red-500 animate-pulse'
                              : preExpiringBookingIds.has(booking.id)
                              ? 'bg-yellow-100 border-l-4 border-yellow-500 animate-subtle-pulse'
                              : 'bg-blue-50 border-l-4 border-blue-500'
                          )}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div>
                            <p className="font-medium">{booking.title}</p>
                            <p className="text-sm text-gray-600">
                              {format(booking.start_time, 'HH:mm')} - {format(booking.end_time, 'HH:mm')} par {Object.values(users).find(u => u.id === booking.booked_by)?.name || 'Inconnu'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm pt-2">Aucune réservation pour cette salle à cette date.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      {canManageBookings(currentUserRole) && (
        <AddBookingDialog
          rooms={rooms}
          doctors={doctors}
          onAddBooking={onAddBooking}
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          initialData={newBookingInfo}
        />
      )}
      {selectedBooking && selectedBookingUser && (
        <BookingDetailsDialog
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          room={rooms.find(r => r.id === selectedBooking.room_id)!}
          user={selectedBookingUser}
          doctors={doctors}
          onDelete={handleDeleteBooking}
          onEdit={handleOpenEditDialog}
          onStartBooking={onStartBooking}
          onEndBooking={onEndBooking}
          currentUser={currentUser}
          currentUsername={currentUsername}
        />
      )}
      {canManageBookings(currentUserRole) && bookingToEdit && (
        <EditBookingDialog
          isOpen={!!bookingToEdit}
          onOpenChange={() => setBookingToEdit(null)}
          booking={bookingToEdit}
          rooms={rooms}
          doctors={doctors}
          onUpdateBooking={updateBooking}
        />
      )}
    </Card>
  );
};