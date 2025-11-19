# 📁 Documentação e Scripts

Esta pasta contém toda a documentação, scripts SQL e arquivos auxiliares do projeto.

## 📂 Estrutura

```
docs/
├── sql/              # Scripts SQL para o banco de dados Supabase
├── scripts/          # Scripts de automação (PowerShell, Batch)
└── *.md              # Documentação em Markdown
```

## 📄 Arquivos SQL

Todos os scripts SQL estão organizados em `docs/sql/`:

- Scripts de criação de tabelas
- Scripts de migração
- Scripts de correção de políticas (RLS)
- Scripts de dados iniciais

### Como usar:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Copie e cole o conteúdo do script desejado
4. Execute o script

## 🔧 Scripts

Scripts de automação estão em `docs/scripts/`:

- Scripts PowerShell (`.ps1`)
- Scripts Batch (`.bat`)
- Scripts para Git/GitHub

## 📚 Documentação

Documentação do projeto em Markdown:

- `INSTRUCOES_PWA.md` - Instruções para PWA
- `RESUMO_IMPLEMENTACAO_PWA_LOGIN.md` - Resumo da implementação
- `GUIA_*.md` - Guias diversos
- `PROMPT_*.md` - Prompts e instruções
- Outros arquivos de documentação

## 🗄️ Banco de Dados

O sistema utiliza **Supabase** como banco de dados.

### Configuração:

- URL: Configurada em `src/integrations/supabase/client.ts`
- Autenticação: Supabase Auth
- Row Level Security (RLS): Habilitado

### Scripts importantes:

- `LIMPAR_E_RECRIAR_BANCO.sql` - Limpa e recria o banco
- `CORRIGIR_POLICIES.sql` - Corrige políticas RLS
- `DESABILITAR_RLS.sql` - Desabilita RLS (apenas desenvolvimento)

## ⚠️ Importante

- **Nunca execute scripts SQL em produção sem backup**
- **Teste sempre em ambiente de desenvolvimento primeiro**
- **Revise os scripts antes de executar**

