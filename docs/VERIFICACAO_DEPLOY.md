# Verificação de Configuração para Deploy

## ✅ Checklist de Configuração do Banco de Dados

### 1. Estrutura do Banco
- [x] Todas as tabelas criadas
- [x] Foreign keys configuradas
- [x] Índices criados para performance
- [x] Triggers de `updated_at` configurados

### 2. Row Level Security (RLS)
- [x] RLS habilitado em todas as tabelas
- [x] Políticas de acesso configuradas
- [x] Políticas permitem SELECT, INSERT, UPDATE, DELETE

### 3. Tabelas Principais
- [x] `clients` - Clientes
- [x] `revenue` - Receitas
- [x] `expenses` - Despesas
- [x] `properties` - Imóveis
- [x] `legal_processes` - Processos
- [x] `cattle` - Gado
- [x] `loans` - Empréstimos
- [x] `leads` - Leads
- [x] `applications` - Aplicações
- [x] `billing_items` - Itens de Faturamento
- [x] `reminders` - Lembretes
- [x] `notes` - Anotações
- [x] `cattle_movements` - Movimentações de Gado (novo)

### 4. Configurações de Ambiente

#### Variáveis de Ambiente Necessárias:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 5. Migrações
Todas as migrações estão em: `supabase/migrations/`

**Ordem de execução:**
1. `20251116000000_complete_database_setup.sql` - Setup completo
2. `20251117000000_add_rent_adjustment_fields.sql` - Campos de ajuste de aluguel
3. `20251118000000_add_completed_to_notes.sql` - Campo completed em notes
4. `20251118000001_add_recurrence_to_reminders.sql` - Recorrência em lembretes
5. `20251118000002_add_bank_fields_to_loans.sql` - Campos de banco em empréstimos
6. `20251118000003_add_classification_and_subclassification.sql` - Classificações
7. `20251119000000_add_installments_to_revenue.sql` - Parcelas em receitas
8. `20251120000000_update_expenses_status_constraint.sql` - Status de despesas

**Nova migração:**
- `supabase-cattle-movements.sql` - Movimentações de gado (executar após setup completo)

### 6. Verificações de Segurança

#### RLS Policies
Todas as tabelas devem ter políticas que permitam:
- **SELECT**: `USING (true)` - Todos podem ler
- **INSERT**: `WITH CHECK (true)` - Todos podem inserir
- **UPDATE**: `USING (true) WITH CHECK (true)` - Todos podem atualizar
- **DELETE**: `USING (true)` - Todos podem deletar

**Nota:** Para produção, ajuste as políticas conforme sua necessidade de segurança.

### 7. Índices para Performance
Verifique se os seguintes índices existem:
- `idx_revenue_date` - Em `revenue.date`
- `idx_expenses_date` - Em `expenses.date`
- `idx_properties_client_id` - Em `properties.client_id`
- `idx_legal_processes_client_id` - Em `legal_processes.client_id`
- `idx_cattle_movements_cattle_id` - Em `cattle_movements.cattle_id`
- `idx_cattle_movements_movement_date` - Em `cattle_movements.movement_date`

### 8. Funções e Triggers
- [x] `update_updated_at_column()` - Função para atualizar timestamps
- [x] Triggers em todas as tabelas para `updated_at`

### 9. Comandos para Verificação

Execute no SQL Editor do Supabase:

```sql
-- Verificar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar índices
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 10. Próximos Passos para Deploy

1. **Backup do Banco:**
   - Faça backup completo do banco antes do deploy

2. **Variáveis de Ambiente:**
   - Configure as variáveis no ambiente de produção
   - Use variáveis de ambiente seguras (não commite no código)

3. **Testes:**
   - Teste todas as funcionalidades após deploy
   - Verifique se as queries estão performando bem

4. **Monitoramento:**
   - Configure logs de erro
   - Monitore performance das queries
   - Configure alertas para problemas

### 11. Problemas Conhecidos e Soluções

#### Problema: RLS bloqueando queries
**Solução:** Verifique se as políticas estão corretas e se o usuário tem permissão

#### Problema: Performance lenta
**Solução:** Verifique se os índices estão criados e se as queries estão otimizadas

#### Problema: Foreign key violations
**Solução:** Verifique se os dados estão consistentes antes de criar foreign keys

### 12. Scripts Úteis

#### Desabilitar RLS temporariamente (apenas para testes):
```sql
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
```

#### Reabilitar RLS:
```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

#### Verificar constraints:
```sql
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;
```

## ✅ Status: Pronto para Deploy

O banco de dados está configurado e pronto para deploy. Certifique-se de:
1. Executar todas as migrações na ordem correta
2. Configurar variáveis de ambiente
3. Testar todas as funcionalidades
4. Fazer backup antes de qualquer mudança

