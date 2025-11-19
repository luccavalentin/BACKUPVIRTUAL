-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT,
  institution TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  application_date DATE,
  maturity_date DATE,
  interest_rate DECIMAL(5, 2),
  profitability DECIMAL(15, 2),
  status TEXT CHECK (status IN ('Ativa', 'Resgatada', 'Vencida', 'Cancelada')) DEFAULT 'Ativa',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create public access policy for applications
CREATE POLICY "Public access to applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

