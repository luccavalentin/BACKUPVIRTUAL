-- Create billing_items table
CREATE TABLE IF NOT EXISTS public.billing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  monthly_values JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

-- Create public access policy for billing_items
CREATE POLICY "Public access to billing_items" ON public.billing_items FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_billing_items_updated_at 
  BEFORE UPDATE ON public.billing_items 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

