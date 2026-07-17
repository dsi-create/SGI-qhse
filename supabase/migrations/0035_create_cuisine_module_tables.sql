-- Module Cuisine (migration Supabase)
-- Inventaire courses, dépenses, repas patients/employés, planning menus

CREATE TABLE IF NOT EXISTS public.cuisine_grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  min_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(12,2) NULL,
  supplier TEXT NULL,
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cuisine_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'courses',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NULL,
  receipt_ref TEXT NULL,
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cuisine_patient_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL DEFAULT 'dejeuner',
  service_unit TEXT NOT NULL,
  diet_type TEXT NOT NULL DEFAULT 'normal',
  portions INTEGER NOT NULL DEFAULT 0,
  menu_description TEXT NULL,
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cuisine_employee_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL DEFAULT 'dejeuner',
  menu_description TEXT NOT NULL,
  portions_planned INTEGER NOT NULL DEFAULT 0,
  portions_served INTEGER NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cuisine_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT NOT NULL DEFAULT 'dejeuner',
  audience TEXT NOT NULL DEFAULT 'patients',
  menu_items TEXT NOT NULL,
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cuisine_grocery_name_idx ON public.cuisine_grocery_items (name);
CREATE INDEX IF NOT EXISTS cuisine_expenses_date_idx ON public.cuisine_expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS cuisine_patient_meals_date_idx ON public.cuisine_patient_meals (meal_date DESC);
CREATE INDEX IF NOT EXISTS cuisine_employee_meals_date_idx ON public.cuisine_employee_meals (meal_date DESC);
CREATE INDEX IF NOT EXISTS cuisine_meal_plans_week_idx ON public.cuisine_meal_plans (week_start, day_of_week);

ALTER TABLE public.cuisine_grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisine_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisine_patient_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisine_employee_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisine_meal_plans ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'cuisine_grocery_items',
    'cuisine_expenses',
    'cuisine_patient_meals',
    'cuisine_employee_meals',
    'cuisine_meal_plans'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Cuisine authenticated select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Cuisine authenticated write" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Cuisine authenticated select" ON public.%I FOR SELECT TO authenticated USING (true)',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Cuisine authenticated write" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;
