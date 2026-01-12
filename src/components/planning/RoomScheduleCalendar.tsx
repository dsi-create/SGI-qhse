import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { Booking, Room, User } from "@/types";
import { Button } from "@/components/ui/button";

interface AvailabilitySlot {
  start: string;
  end: string;
  room: string;
  shortRoom: string;
  specialty: string;
  doctor: string;
  location?: string;
}

const statusColors: Record<string, string> = {
  réservé: "bg-blue-500",
  en_cours: "bg-amber-500",
  terminé: "bg-emerald-500",
  annulé: "bg-rose-500",
};

const getStatusColor = (status: string) => statusColors[status] || "bg-slate-400";

interface RoomScheduleCalendarProps {
  bookings: Booking[];
  rooms: Room[];
  users: { [username: string]: User };
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectBooking: (booking: Booking) => void;
  totalRooms: number;
  fallbackSlots?: AvailabilitySlot[];
  hasRealRooms: boolean;
  canManageBookings: boolean;
  onCreateSlot?: (slot: AvailabilitySlot) => void;
}

const occupancyClass = (ratio: number) => {
  if (ratio === 0) return "bg-cyan-300 text-cyan-900";
  if (ratio <= 0.33) return "bg-emerald-200 text-emerald-800";
  if (ratio <= 0.66) return "bg-amber-200 text-amber-800";
  return "bg-rose-300 text-rose-900";
};

export const RoomScheduleCalendar = ({
  bookings,
  rooms,
  users,
  selectedDate,
  onSelectDate,
  onSelectBooking,
  totalRooms,
  fallbackSlots = [],
  hasRealRooms,
  canManageBookings,
  onCreateSlot,
}: RoomScheduleCalendarProps) => {
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const key = format(booking.start_time, "yyyy-MM-dd");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(booking);
    });
    // sort each day
    map.forEach((dayBookings) => {
      dayBookings.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    });
    return map;
  }, [bookings]);

  const occupancyByDay = useMemo(() => {
    const map = new Map<string, { ratio: number; count: number; roomsUsed: number }>();
    bookingsByDay.forEach((dayBookings, key) => {
      const uniqueRooms = new Set(dayBookings.map((booking) => booking.room_id));
      const ratio =
        totalRooms > 0 ? Math.min(uniqueRooms.size / totalRooms, 1) : uniqueRooms.size > 0 ? 1 : 0;
      map.set(key, {
        ratio,
        count: dayBookings.length,
        roomsUsed: uniqueRooms.size,
      });
    });
    return map;
  }, [bookingsByDay, totalRooms]);

  const busyDates = useMemo(
    () =>
      Array.from(bookingsByDay.keys()).map((key) =>
        parse(key, "yyyy-MM-dd", selectedDate ?? new Date()),
      ),
    [bookingsByDay, selectedDate],
  );

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const bookingsForSelectedDay = bookingsByDay.get(selectedKey) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="border border-cyan-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon name="CalendarRange" className="text-cyan-600" />
            Vue calendrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DayPicker
            mode="single"
            locale={fr}
            weekStartsOn={1}
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onSelectDate(date);
              }
            }}
            showOutsideDays
            modifiers={{ busy: busyDates }}
            modifiersClassNames={{
              busy: "rounded-md bg-cyan-100 text-gray-900",
            }}
            className="mx-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-semibold text-gray-700",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100",
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-muted-foreground rounded-md w-10 font-medium uppercase text-[0.7rem]",
              row: "flex w-full mt-2",
              cell: "h-12 w-12 text-center text-sm p-0 relative",
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-0 font-medium aria-selected:opacity-100",
              ),
              day_selected:
                "bg-cyan-600 text-white hover:bg-cyan-600 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400",
              day_today: "bg-cyan-100 text-cyan-900",
              day_outside:
                "day-outside text-muted-foreground opacity-40 aria-selected:bg-cyan-100/60 aria-selected:text-muted-foreground",
            }}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, "yyyy-MM-dd");
                const occupancy = occupancyByDay.get(key);
                return (
                  <div className="flex h-full flex-col items-center justify-center">
                    <span>{date.getDate()}</span>
                    {occupancy && occupancy.count > 0 && (
                      <span
                        className={cn(
                          "mt-1 rounded-full px-1 text-[10px] font-semibold",
                          occupancyClass(occupancy.ratio),
                        )}
                      >
                        {occupancy.roomsUsed}/{totalRooms || occupancy.roomsUsed}
                      </span>
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="border border-cyan-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon name="DoorOpen" className="text-cyan-600" />
            Occupation du {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingsForSelectedDay.length === 0 ? (
            <div className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/40 p-4 text-sm text-gray-600">
              <p className="font-medium">Aucune réservation enregistrée pour cette date.</p>
              {fallbackSlots.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Créneaux prévus selon la grille de référence :
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {fallbackSlots.map((slot, index) => (
                      <li
                        key={`${slot.room}-${index}`}
                        className="rounded-lg border border-cyan-100 bg-white px-3 py-2"
                      >
                        <div className="font-medium text-gray-800">{slot.shortRoom}</div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{slot.start} - {slot.end}</span>
                          <span>{slot.specialty}</span>
                        </div>
                    {onCreateSlot && hasRealRooms && canManageBookings && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCreateSlot(slot)}
                            >
                              <Icon name="Plus" className="mr-2 h-4 w-4" />
                              Planifier ce créneau
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsForSelectedDay.map((booking) => {
                const room = rooms.find((r) => r.id === booking.room_id);
                const booker =
                  Object.values(users).find((u) => u.id === booking.booked_by)?.name ?? "Inconnu";
                return (
                  <button
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className="w-full rounded-lg border border-cyan-100 bg-white px-4 py-3 text-left shadow-sm transition-transform hover:scale-[1.01] hover:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {format(booking.start_time, "HH:mm")} – {format(booking.end_time, "HH:mm")}
                          </span>
                          <Badge
                            className={cn(
                              "capitalize",
                              getStatusColor(booking.status),
                            )}
                          >
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {room ? room.name : "Salle inconnue"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Réservé par {booker}
                        </div>
                      </div>
                      <Icon name="ArrowUpRight" className="h-4 w-4 text-cyan-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

