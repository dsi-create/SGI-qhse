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
import { format } from "date-fns";
import { useCuisineTable } from "./useCuisineTable";
import { EXPENSE_CATEGORIES, labelOf } from "./cuisineConstants";

interface Expense {
  id: string;
  expense_date: string;
  label: string;
  category: string;
  amount: number;
  payment_method: string | null;
  receipt_ref: string | null;
  notes: string | null;
}

const emptyForm = {
  expense_date: format(new Date(), "yyyy-MM-dd"),
  label: "",
  category: "courses",
  amount: "",
  payment_method: "",
  receipt_ref: "",
  notes: "",
};

export const CuisineExpensesList = () => {
  const { rows, loading, createRow, updateRow, deleteRow } = useCuisineTable<Expense>(
    "cuisine_expenses",
    "expense_date",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: Expense) => {
    setEditing(item);
    setForm({
      expense_date: item.expense_date?.slice(0, 10) || format(new Date(), "yyyy-MM-dd"),
      label: item.label,
      category: item.category,
      amount: String(item.amount ?? 0),
      payment_method: item.payment_method || "",
      receipt_ref: item.receipt_ref || "",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.amount) {
      showError("Libellé et montant requis.");
      return;
    }
    const payload = {
      expense_date: form.expense_date,
      label: form.label.trim(),
      category: form.category,
      amount: Number(form.amount) || 0,
      payment_method: form.payment_method.trim() || null,
      receipt_ref: form.receipt_ref.trim() || null,
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
            <Icon name="CreditCard" className="text-teal-600" />
            Dépenses cuisine
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Total enregistré : {total.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Ajouter une dépense</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier la dépense" : "Nouvelle dépense"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
                </div>
                <div>
                  <Label>Montant</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Libellé</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Paiement</Label>
                  <Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="Espèces, virement…" />
                </div>
              </div>
              <div>
                <Label>Réf. reçu</Label>
                <Input value={form.receipt_ref} onChange={(e) => setForm({ ...form, receipt_ref: e.target.value })} />
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
                <TableHead>Libellé</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.expense_date?.slice(0, 10)}</TableCell>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>{labelOf(EXPENSE_CATEGORIES, item.category)}</TableCell>
                  <TableCell>{Number(item.amount).toLocaleString("fr-FR")} FCFA</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Aucune dépense enregistrée.
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
