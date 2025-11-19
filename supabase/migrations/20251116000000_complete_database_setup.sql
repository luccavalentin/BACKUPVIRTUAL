-- =====================================================
-- SCRIPT COMPLETO DE LIMPEZA E CRIAÇÃO DO BANCO DE DADOS
-- Sistema de Gestão Financeira
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Ele irá REMOVER todas as tabelas, triggers, policies e funções existentes
-- 3. Em seguida, recriará tudo do zero com a estrutura completa
-- 
-- ATENÇÃO: Este script apagará TODOS os dados existentes!
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPEZA COMPLETA DO BANCO
-- =====================================================

-- Remove todas as policies existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Public access to ' || r.tablename || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- Remove todos os triggers (com verificação de existência da tabela)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
        DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminders') THEN
        DROP TRIGGER IF EXISTS update_reminders_updated_at ON public.reminders;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'revenue') THEN
        DROP TRIGGER IF EXISTS update_revenue_updated_at ON public.revenue;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
        DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_processes') THEN
        DROP TRIGGER IF EXISTS update_legal_processes_updated_at ON public.legal_processes;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cattle') THEN
        DROP TRIGGER IF EXISTS update_cattle_updated_at ON public.cattle;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loans') THEN
        DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
        DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
        DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_items') THEN
        DROP TRIGGER IF EXISTS update_billing_items_updated_at ON public.billing_items;
    END IF;
END $$;

-- Remove todas as tabelas (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS public.billing_items CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.revenue CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.legal_processes CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.cattle CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Remove a função de atualização de timestamps
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- PARTE 2: CRIAÇÃO DA FUNÇÃO DE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- PARTE 3: CRIAÇÃO DAS TABELAS
-- =====================================================

-- 1. TABELA: clients (Clientes)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('person', 'company')),
  cpf_cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. TABELA: reminders (Tarefas/Lembretes)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluida')) DEFAULT 'pendente',
  priority TEXT CHECK (priority IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. TABELA: notes (Anotações)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TABELA: properties (Imóveis)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  cep TEXT,
  city TEXT,
  area DECIMAL(15, 2),
  registration TEXT,
  documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
  water_ownership TEXT CHECK (water_ownership IN ('PROPRIO', 'TERCEIROS')),
  energy_ownership TEXT CHECK (energy_ownership IN ('PROPRIO', 'TERCEIROS')),
  outstanding_bills TEXT,
  contract_start DATE,
  contract_end DATE,
  venal_value DECIMAL(15, 2),
  municipal_registration TEXT,
  rent_adjustment_percentage DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. TABELA: revenue (Receitas)
CREATE TABLE IF NOT EXISTS public.revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  classification TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'received')) DEFAULT 'pending',
  frequency TEXT CHECK (frequency IN ('Única', 'Mensal', 'Trimestral', 'Anual')),
  documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
  client_id UUID REFERENCES public.clients(id),
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. TABELA: expenses (Despesas)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. TABELA: legal_processes (Processos Legais)
CREATE TABLE IF NOT EXISTS public.legal_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_number TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'pending', 'closed')) DEFAULT 'active',
  has_sentence BOOLEAN DEFAULT false,
  estimated_value DECIMAL(15, 2),
  payment_forecast DATE,
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. TABELA: cattle (Gado)
CREATE TABLE IF NOT EXISTS public.cattle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identification TEXT,
  breed TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  birth_date DATE,
  category TEXT,
  origin TEXT,
  age_months INTEGER,
  health_status TEXT CHECK (health_status IN ('Boa', 'Regular', 'Ruim')),
  location TEXT,
  purchase_price DECIMAL(15, 2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. TABELA: loans (Empréstimos)
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('loan_given', 'loan_received')),
  link_type TEXT CHECK (link_type IN ('person', 'property', 'other')),
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. TABELA: leads (Leads)
CREATE TABLE IF NOT EXISTS public.leads (
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

-- 11. TABELA: applications (Aplicações Financeiras)
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

-- 12. TABELA: billing_items (Faturamento)
CREATE TABLE IF NOT EXISTS public.billing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  monthly_values JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PARTE 4: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 5: CRIAR POLICIES DE ACESSO PÚBLICO
-- =====================================================

CREATE POLICY "Public access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to revenue" ON public.revenue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to legal_processes" ON public.legal_processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to cattle" ON public.cattle FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to billing_items" ON public.billing_items FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PARTE 6: CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- =====================================================

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at 
  BEFORE UPDATE ON public.reminders 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON public.notes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at 
  BEFORE UPDATE ON public.revenue 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_processes_updated_at 
  BEFORE UPDATE ON public.legal_processes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cattle_updated_at 
  BEFORE UPDATE ON public.cattle 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
  BEFORE UPDATE ON public.loans 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.leads 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_items_updated_at 
  BEFORE UPDATE ON public.billing_items 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- 
-- Após executar este script, todas as tabelas estarão criadas
-- com todas as colunas necessárias para o funcionamento completo do sistema.
-- 
-- Verifique se não há erros no console do Supabase após a execução.
-- =====================================================


-- Sistema de Gestão Financeira
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Ele irá REMOVER todas as tabelas, triggers, policies e funções existentes
-- 3. Em seguida, recriará tudo do zero com a estrutura completa
-- 
-- ATENÇÃO: Este script apagará TODOS os dados existentes!
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPEZA COMPLETA DO BANCO
-- =====================================================

-- Remove todas as policies existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Public access to ' || r.tablename || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- Remove todos os triggers (com verificação de existência da tabela)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
        DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminders') THEN
        DROP TRIGGER IF EXISTS update_reminders_updated_at ON public.reminders;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
        DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'revenue') THEN
        DROP TRIGGER IF EXISTS update_revenue_updated_at ON public.revenue;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
        DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_processes') THEN
        DROP TRIGGER IF EXISTS update_legal_processes_updated_at ON public.legal_processes;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cattle') THEN
        DROP TRIGGER IF EXISTS update_cattle_updated_at ON public.cattle;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loans') THEN
        DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
        DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
        DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_items') THEN
        DROP TRIGGER IF EXISTS update_billing_items_updated_at ON public.billing_items;
    END IF;
END $$;

-- Remove todas as tabelas (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS public.billing_items CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.revenue CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.legal_processes CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.cattle CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Remove a função de atualização de timestamps
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- PARTE 2: CRIAÇÃO DA FUNÇÃO DE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- PARTE 3: CRIAÇÃO DAS TABELAS
-- =====================================================

-- 1. TABELA: clients (Clientes)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('person', 'company')),
  cpf_cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. TABELA: reminders (Tarefas/Lembretes)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluida')) DEFAULT 'pendente',
  priority TEXT CHECK (priority IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. TABELA: notes (Anotações)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TABELA: properties (Imóveis)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  cep TEXT,
  city TEXT,
  area DECIMAL(15, 2),
  registration TEXT,
  documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
  water_ownership TEXT CHECK (water_ownership IN ('PROPRIO', 'TERCEIROS')),
  energy_ownership TEXT CHECK (energy_ownership IN ('PROPRIO', 'TERCEIROS')),
  outstanding_bills TEXT,
  contract_start DATE,
  contract_end DATE,
  venal_value DECIMAL(15, 2),
  municipal_registration TEXT,
  rent_adjustment_percentage DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. TABELA: revenue (Receitas)
CREATE TABLE IF NOT EXISTS public.revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  classification TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'received')) DEFAULT 'pending',
  frequency TEXT CHECK (frequency IN ('Única', 'Mensal', 'Trimestral', 'Anual')),
  documentation_status TEXT CHECK (documentation_status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
  client_id UUID REFERENCES public.clients(id),
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. TABELA: expenses (Despesas)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. TABELA: legal_processes (Processos Legais)
CREATE TABLE IF NOT EXISTS public.legal_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_number TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'pending', 'closed')) DEFAULT 'active',
  has_sentence BOOLEAN DEFAULT false,
  estimated_value DECIMAL(15, 2),
  payment_forecast DATE,
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. TABELA: cattle (Gado)
CREATE TABLE IF NOT EXISTS public.cattle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identification TEXT,
  breed TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  birth_date DATE,
  category TEXT,
  origin TEXT,
  age_months INTEGER,
  health_status TEXT CHECK (health_status IN ('Boa', 'Regular', 'Ruim')),
  location TEXT,
  purchase_price DECIMAL(15, 2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. TABELA: loans (Empréstimos)
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('loan_given', 'loan_received')),
  link_type TEXT CHECK (link_type IN ('person', 'property', 'other')),
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  client_id UUID REFERENCES public.clients(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. TABELA: leads (Leads)
CREATE TABLE IF NOT EXISTS public.leads (
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

-- 11. TABELA: applications (Aplicações Financeiras)
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

-- 12. TABELA: billing_items (Faturamento)
CREATE TABLE IF NOT EXISTS public.billing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  monthly_values JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PARTE 4: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 5: CRIAR POLICIES DE ACESSO PÚBLICO
-- =====================================================

CREATE POLICY "Public access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to revenue" ON public.revenue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to legal_processes" ON public.legal_processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to cattle" ON public.cattle FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to billing_items" ON public.billing_items FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PARTE 6: CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- =====================================================

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at 
  BEFORE UPDATE ON public.reminders 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON public.notes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at 
  BEFORE UPDATE ON public.revenue 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_processes_updated_at 
  BEFORE UPDATE ON public.legal_processes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cattle_updated_at 
  BEFORE UPDATE ON public.cattle 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
  BEFORE UPDATE ON public.loans 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.leads 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_items_updated_at 
  BEFORE UPDATE ON public.billing_items 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- 
-- Após executar este script, todas as tabelas estarão criadas
-- com todas as colunas necessárias para o funcionamento completo do sistema.
-- 
-- Verifique se não há erros no console do Supabase após a execução.
-- =====================================================




















