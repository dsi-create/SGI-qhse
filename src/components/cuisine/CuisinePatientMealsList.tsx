import { useState } from "react";
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
import { format } from "date-fns";
import { useCuisineTable } from "./useCuisineTable";
import { DIET_TYPES, MEAL_TYPES, labelOf } from "./cuisineConstants";

interface PatientMeal {
  id: string;
  meal_date: string;
  meal_type: string;
  service_unit: string;
  diet_type: string;
  portions: number;
  menu_description: string | null;
  notes: string | null;
}

const emptyForm = {
  meal_date: format(new Date(), "yyyy-MM-dd"),
  meal_type: "dejeuner",
  service_unit: "",
  diet_type: "normal",
  portions: "0",
  menu_description: "",
  notes: "",
};

export const CuisinePatientMealsList = () => {
  const { rows, loading, createRow, updateRow, deleteRow } = useCuisineTable<PatientMeal>(
    "cuisine_patient_meals",
    "meal_date",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PatientMeal | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: PatientMeal) => {
    setEditing(item);
    setForm({
      meal_date: item.meal_date?.slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
      meal_type: item.meal_type,
      service_unit: item.service_unit,
      diet_type: item.diet_type,
      portions: String(item.portions ?? 0),
      menu_description: item.menu_description || "",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.service_unit.trim()) {
      showError("Le service / unité est requis.");
      return;
    }
    const payload = {
      meal_date: form.meal_date,
      meal_type: form.meal_type,
      service_unit: form.service_unit.trim(),
      diet_type: form.diet_type,
      portions: Number(form.portions) || 0,
      menu_description: form.menu_description.trim() || null,
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
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon name="HeartPulse" className="text-rose-600" />
            Repas patients
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">{rows.length} enregistrement(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Ajouter un repas</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le repas patient" : "Nouveau repas patient"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.meal_date} onChange={(e) => setForm({ ...form, meal_date: e.target.value })} />
                </div>
                <div>
                  <Label>Type de repas</Label>
                  <Select value={form.meal_type} onValueChange={(v) => setForm({ ...form, meal_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Service / unité</Label>
                  <Input value={form.service_unit} onChange={(e) => setForm({ ...form, service_unit: e.target.value })} placeholder="Hospitalisation 1er…" />
                </div>
                <div>
                  <Label>Régime</Label>
                  <Select value={form.diet_type} onValueChange={(v) => setForm({ ...form, diet_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIET_TYPES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Portions</Label>
                <Input type="number" value={form.portions} onChange={(e) => setForm({ ...form, portions: e.target.value })} />
              </div>
              <div>
                <Label>Menu</Label>
                <Textarea value={form.menu_description} onChange={(e) => setForm({ ...form, menu_description: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={save}>Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Régime</TableHead>
                <TableHead>Portions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.meal_date?.slice(0, 10)}</TableCell>
                  <TableCell>{labelOf(MEAL_TYPES, item.meal_type)}</TableCell>
                  <TableCell className="font-medium">{item.service_unit}</TableCell>
                  <TableCell>{labelOf(DIET_TYPES, item.diet_type)}</TableCell>
                  <TableCell>{item.portions}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Aucun repas patient enregistré.
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
