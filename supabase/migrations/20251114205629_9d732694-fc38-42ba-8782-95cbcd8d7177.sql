-- Make properties name optional since address is the primary identifier
ALTER TABLE public.properties ALTER COLUMN name DROP NOT NULL;