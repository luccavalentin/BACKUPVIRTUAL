-- Add missing columns to cattle table
ALTER TABLE public.cattle 
  ADD COLUMN category TEXT,
  ADD COLUMN origin TEXT,
  ADD COLUMN age_months INTEGER,
  ADD COLUMN health_status TEXT CHECK (health_status IN ('Boa', 'Regular', 'Ruim')),
  ADD COLUMN location TEXT,
  ADD COLUMN purchase_price DECIMAL(15, 2),
  ADD COLUMN purchase_date DATE;

-- Add missing columns to properties table
ALTER TABLE public.properties
  ADD COLUMN city TEXT,
  ADD COLUMN documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
  ADD COLUMN water_ownership TEXT CHECK (water_ownership IN ('PROPRIO', 'TERCEIROS')),
  ADD COLUMN energy_ownership TEXT CHECK (energy_ownership IN ('PROPRIO', 'TERCEIROS')),
  ADD COLUMN outstanding_bills TEXT,
  ADD COLUMN contract_start DATE,
  ADD COLUMN contract_end DATE,
  ADD COLUMN venal_value DECIMAL(15, 2);

-- Add missing columns to legal_processes table
ALTER TABLE public.legal_processes
  ADD COLUMN has_sentence BOOLEAN DEFAULT false,
  ADD COLUMN estimated_value DECIMAL(15, 2),
  ADD COLUMN payment_forecast DATE;

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  contract_value DECIMAL(15, 2),
  status TEXT CHECK (status IN ('Inicial', 'Em Andamento', 'Concluído', 'Cancelado')) DEFAULT 'Inicial',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create public access policy for leads
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic timestamp updates on leads
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.leads 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();