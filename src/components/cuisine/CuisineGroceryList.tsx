import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/Loading";
import { Icon } from "@/components/Icon";
import { showError } from "@/utils/toast";
import { useCuisineTable } from "./useCuisineTable";
import { GROCERY_CATEGORIES, labelOf } from "./cuisineConstants";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  unit_price: number | null;
  supplier: string | null;
  notes: string | null;
}

const emptyForm = {
  name: "",
  category: "frais",
  quantity: "0",
  unit: "kg",
  min_stock: "0",
  unit_price: "",
  supplier: "",
  notes: "",
};

export const CuisineGroceryList = () => {
  const { rows, loading, createRow, updateRow, deleteRow } = useCuisineTable<GroceryItem>(
    "cuisine_grocery_items",
    "updated_at",
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GroceryItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const lowStock = useMemo(
    () => rows.filter((r) => Number(r.quantity) <= Number(r.min_stock)).length,
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: GroceryItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity ?? 0),
      unit: item.unit || "kg",
      min_stock: String(item.min_stock ?? 0),
      unit_price: item.unit_price != null ? String(item.unit_price) : "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      showError("Le nom du produit est requis.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity) || 0,
      unit: form.unit.trim() || "unité",
      min_stock: Number(form.min_stock) || 0,
      unit_price: form.unit_price ? Number(form.unit_price) : null,
      supplier: form.supplier.trim() || null,
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
            <Icon name="PackageSearch" className="text-amber-600" />
            Inventaire des courses
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} produit(s) · {lowStock} stock(s) bas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Ajouter un produit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GROCERY_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unité</Label>
                  <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantité</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <Label>Stock mini</Label>
                  <Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prix unitaire</Label>
                  <Input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
                </div>
                <div>
                  <Label>Fournisseur</Label>
                  <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
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
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((item) => {
                const low = Number(item.quantity) <= Number(item.min_stock);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{labelOf(GROCERY_CATEGORIES, item.category)}</TableCell>
                    <TableCell>
                      <Badge className={low ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                        {item.quantity} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.supplier || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Modifier</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteRow(item.id)}>Supprimer</Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Aucun produit. Ajoutez l’inventaire des courses.
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
