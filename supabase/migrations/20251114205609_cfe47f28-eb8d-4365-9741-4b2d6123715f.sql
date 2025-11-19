-- Make cattle identification optional
ALTER TABLE public.cattle ALTER COLUMN identification DROP NOT NULL;

-- Make legal_processes process_number optional
ALTER TABLE public.legal_processes ALTER COLUMN process_number DROP NOT NULL;

-- Add missing columns to revenue table
ALTER TABLE public.revenue
  ADD COLUMN property_id UUID REFERENCES public.properties(id),
  ADD COLUMN frequency TEXT CHECK (frequency IN ('Única', 'Mensal', 'Trimestral', 'Anual')),
  ADD COLUMN documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO'));

-- Fix the update_updated_at_column function to have immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;