import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/Loading";
import { Icon } from "@/components/Icon";
import { showError } from "@/utils/toast";
import { format, startOfWeek } from "date-fns";
import { useCuisineTable } from "./useCuisineTable";
import { MEAL_TYPES, WEEK_DAYS, labelOf } from "./cuisineConstants";

interface MealPlan {
  id: string;
  week_start: string;
  day_of_week: number;
  meal_type: string;
  audience: string;
  menu_items: string;
  notes: string | null;
}

const emptyForm = {
  week_start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  day_of_week: "1",
  meal_type: "dejeuner",
  audience: "patients",
  menu_items: "",
  notes: "",
};

export const CuisineMealPlanning = () => {
  const { rows, loading, createRow, updateRow, deleteRow } = useCuisineTable<MealPlan>(
    "cuisine_meal_plans",
    "week_start",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MealPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [weekFilter, setWeekFilter] = useState(emptyForm.week_start);

  const filtered = useMemo(
    () => rows.filter((r) => r.week_start?.slice(0, 10) === weekFilter),
    [rows, weekFilter],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, week_start: weekFilter });
    setOpen(true);
  };

  const openEdit = (item: MealPlan) => {
    setEditing(item);
    setForm({
      week_start: item.week_start?.slice(0, 10) || weekFilter,
      day_of_week: String(item.day_of_week),
      meal_type: item.meal_type,
      audience: item.audience,
      menu_items: item.menu_items,
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.menu_items.trim()) {
      showError("Le menu est requis.");
      return;
    }
    const payload = {
      week_start: form.week_start,
      day_of_week: Number(form.day_of_week),
      meal_type: form.meal_type,
      audience: form.audience,
      menu_items: form.menu_items.trim(),
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) await updateRow(editing.id, payload);
      else await createRow(payload);
      setOpen(false);
    } catch (e: any) {
      showError(e?.message || "Erreur d'enregistrement");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CalendarDays" className="text-indigo-600" />
            Planning des menus
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">Planification hebdomadaire patients & employés</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="w-auto"
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>Ajouter au planning</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le planning" : "Nouveau créneau menu"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Semaine (lundi)</Label>
                    <Input type="date" value={form.week_start} onChange={(e) => setForm({ ...form, week_start: e.target.value })} />
                  </div>
                  <div>
                    <Label>Jour</Label>
                    <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEEK_DAYS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Repas</Label>
                    <Select value={form.meal_type} onValueChange={(v) => setForm({ ...form, meal_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEAL_TYPES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Public</Label>
                    <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patients">Patients</SelectItem>
                        <SelectItem value="employes">Employés</SelectItem>
                        <SelectItem value="les_deux">Les deux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Menu</Label>
                  <Textarea value={form.menu_items} onChange={(e) => setForm({ ...form, menu_items: e.target.value })} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button onClick={save}>Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jour</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? filtered
                .slice()
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{labelOf(WEEK_DAYS, item.day_of_week)}</TableCell>
                    <TableCell>{labelOf(MEAL_TYPES, item.meal_type)}</TableCell>
                    <TableCell>
                      {item.audience === "employes" ? "Employés" : item.audience === "les_deux" ? "Les deux" : "Patients"}
                    </TableCell>
                    <TableCell className="max-w-md">{item.menu_items}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Modifier</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)}>Supprimer</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Aucun menu pour cette semaine. Ajoutez le planning.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
