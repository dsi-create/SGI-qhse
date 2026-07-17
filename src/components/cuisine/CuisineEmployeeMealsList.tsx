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
import { MEAL_TYPES, labelOf } from "./cuisineConstants";

interface EmployeeMeal {
  id: string;
  meal_date: string;
  meal_type: string;
  menu_description: string;
  portions_planned: number;
  portions_served: number;
  notes: string | null;
}

const emptyForm = {
  meal_date: format(new Date(), "yyyy-MM-dd"),
  meal_type: "dejeuner",
  menu_description: "",
  portions_planned: "0",
  portions_served: "0",
  notes: "",
};

export const CuisineEmployeeMealsList = () => {
  const { rows, loading, createRow, updateRow, deleteRow } = useCuisineTable<EmployeeMeal>(
    "cuisine_employee_meals",
    "meal_date",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeMeal | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: EmployeeMeal) => {
    setEditing(item);
    setForm({
      meal_date: item.meal_date?.slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
      meal_type: item.meal_type,
      menu_description: item.menu_description,
      portions_planned: String(item.portions_planned ?? 0),
      portions_served: String(item.portions_served ?? 0),
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.menu_description.trim()) {
      showError("La description du menu est requise.");
      return;
    }
    const payload = {
      meal_date: form.meal_date,
      meal_type: form.meal_type,
      menu_description: form.menu_description.trim(),
      portions_planned: Number(form.portions_planned) || 0,
      portions_served: Number(form.portions_served) || 0,
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
            <Icon name="Users" className="text-cyan-600" />
            Repas employés
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">{rows.length} enregistrement(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Ajouter un repas</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le repas employés" : "Nouveau repas employés"}</DialogTitle>
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
              <div>
                <Label>Menu</Label>
                <Textarea value={form.menu_description} onChange={(e) => setForm({ ...form, menu_description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Portions prévues</Label>
                  <Input type="number" value={form.portions_planned} onChange={(e) => setForm({ ...form, portions_planned: e.target.value })} />
                </div>
                <div>
                  <Label>Portions servies</Label>
                  <Input type="number" value={form.portions_served} onChange={(e) => setForm({ ...form, portions_served: e.target.value })} />
                </div>
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
                <TableHead>Menu</TableHead>
                <TableHead>Prévu</TableHead>
                <TableHead>Servi</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.meal_date?.slice(0, 10)}</TableCell>
                  <TableCell>{labelOf(MEAL_TYPES, item.meal_type)}</TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{item.menu_description}</TableCell>
                  <TableCell>{item.portions_planned}</TableCell>
                  <TableCell>{item.portions_served}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Aucun repas employés enregistré.
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
