-- Add new fields to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS municipal_registration TEXT,
  ADD COLUMN IF NOT EXISTS rent_adjustment_percentage DECIMAL(5, 2);

