-- SQL para criar tabela de movimentações de gado
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna description na tabela cattle (se não existir)
ALTER TABLE cattle 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Criar tabela de movimentações de gado
CREATE TABLE IF NOT EXISTS cattle_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2),
  total_value DECIMAL(10, 2),
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  generate_revenue BOOLEAN DEFAULT false,
  generate_expense BOOLEAN DEFAULT false,
  revenue_id UUID REFERENCES revenue(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cattle_movements_cattle_id ON cattle_movements(cattle_id);
CREATE INDEX IF NOT EXISTS idx_cattle_movements_movement_date ON cattle_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_cattle_movements_type ON cattle_movements(movement_type);

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cattle_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_cattle_movements_updated_at ON cattle_movements;
CREATE TRIGGER trigger_update_cattle_movements_updated_at
  BEFORE UPDATE ON cattle_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_cattle_movements_updated_at();

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE cattle_movements ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS (ajuste conforme sua autenticação)
-- Política para SELECT: todos os usuários autenticados podem ver
CREATE POLICY "Users can view cattle movements"
  ON cattle_movements FOR SELECT
  USING (true);

-- Política para INSERT: todos os usuários autenticados podem inserir
CREATE POLICY "Users can insert cattle movements"
  ON cattle_movements FOR INSERT
  WITH CHECK (true);

-- Política para UPDATE: todos os usuários autenticados podem atualizar
CREATE POLICY "Users can update cattle movements"
  ON cattle_movements FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para DELETE: todos os usuários autenticados podem deletar
CREATE POLICY "Users can delete cattle movements"
  ON cattle_movements FOR DELETE
  USING (true);

-- 8. Comentários nas colunas para documentação
COMMENT ON TABLE cattle_movements IS 'Registra todas as entradas e saídas de gado com controle de estoque';
COMMENT ON COLUMN cattle_movements.movement_type IS 'Tipo de movimentação: entrada ou saida';
COMMENT ON COLUMN cattle_movements.quantity IS 'Quantidade de animais na movimentação';
COMMENT ON COLUMN cattle_movements.unit_price IS 'Preço unitário do animal';
COMMENT ON COLUMN cattle_movements.total_value IS 'Valor total da movimentação (quantity * unit_price)';
COMMENT ON COLUMN cattle_movements.generate_revenue IS 'Se true, gera receita automaticamente vinculada';
COMMENT ON COLUMN cattle_movements.generate_expense IS 'Se true, gera despesa automaticamente vinculada';

