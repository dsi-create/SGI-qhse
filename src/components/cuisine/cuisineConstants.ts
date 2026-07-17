export const MEAL_TYPES = [
  { value: "petit_dejeuner", label: "Petit-déjeuner" },
  { value: "dejeuner", label: "Déjeuner" },
  { value: "diner", label: "Dîner" },
  { value: "collation", label: "Collation" },
] as const;

export const GROCERY_CATEGORIES = [
  { value: "frais", label: "Frais" },
  { value: "sec", label: "Sec" },
  { value: "surgeles", label: "Surgelés" },
  { value: "boissons", label: "Boissons" },
  { value: "epices", label: "Épices" },
  { value: "autre", label: "Autre" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "courses", label: "Courses" },
  { value: "fournitures", label: "Fournitures" },
  { value: "gaz", label: "Gaz / énergie" },
  { value: "maintenance", label: "Maintenance cuisine" },
  { value: "autre", label: "Autre" },
] as const;

export const DIET_TYPES = [
  { value: "normal", label: "Normal" },
  { value: "sans_sel", label: "Sans sel" },
  { value: "diabetique", label: "Diabétique" },
  { value: "mixe", label: "Mixé" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "autre", label: "Autre" },
] as const;

export const WEEK_DAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
] as const;

export const labelOf = <T extends { value: string | number; label: string }>(
  list: readonly T[],
  value: string | number,
) => list.find((item) => item.value === value)?.label || String(value);
