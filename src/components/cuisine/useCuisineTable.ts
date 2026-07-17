import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export function useCuisineTable<T extends { id: string }>(table: string, orderColumn: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderColumn, { ascending: false });
      if (error) throw error;
      setRows((data || []) as T[]);
    } catch (e: any) {
      showError(e?.message || `Erreur de chargement (${table})`);
    } finally {
      setLoading(false);
    }
  }, [table, orderColumn]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const createRow = async (payload: Record<string, unknown>) => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from(table).insert([
      { ...payload, created_by: auth.user?.id ?? null },
    ]);
    if (error) throw error;
    showSuccess("Enregistrement créé.");
    await fetchRows();
  };

  const updateRow = async (id: string, payload: Record<string, unknown>) => {
    const { error } = await supabase
      .from(table)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    showSuccess("Enregistrement mis à jour.");
    await fetchRows();
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    showSuccess("Enregistrement supprimé.");
    await fetchRows();
  };

  return { rows, loading, createRow, updateRow, deleteRow };
}
