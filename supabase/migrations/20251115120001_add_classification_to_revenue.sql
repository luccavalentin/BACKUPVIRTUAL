-- Add classification column to revenue table
ALTER TABLE public.revenue
  ADD COLUMN IF NOT EXISTS classification TEXT;

