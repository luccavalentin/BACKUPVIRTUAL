-- Script para atualizar o constraint de status na tabela expenses
-- Execute este script no SQL Editor do Supabase

-- Remover o constraint antigo
ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_status_check;

-- Adicionar novo constraint com valores em português
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_status_check 
  CHECK (status IN ('PENDENTE', 'PAGO', 'AGENDADO'));

-- Atualizar valores existentes de 'pending' para 'PENDENTE' e 'paid' para 'PAGO'
UPDATE public.expenses
  SET status = 'PENDENTE'
  WHERE status = 'pending';

UPDATE public.expenses
  SET status = 'PAGO'
  WHERE status = 'paid';

-- Definir valor padrão como 'PENDENTE'
ALTER TABLE public.expenses
  ALTER COLUMN status SET DEFAULT 'PENDENTE';





