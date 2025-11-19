# 🏢 Sistema de Gestão VANDE

Sistema completo de gestão financeira e patrimonial desenvolvido especialmente para o cliente Vanderlei. Uma solução personalizada e robusta para gerenciar receitas, despesas, imóveis, gado, processos legais e muito mais.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Uso](#-uso)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Banco de Dados](#-banco-de-dados)
- [Desenvolvimento](#-desenvolvimento)
- [Contribuindo](#-contribuindo)
- [Contato](#-contato)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **Sistema de Gestão VANDE** é uma aplicação web completa desenvolvida para gerenciar todos os aspectos financeiros e patrimoniais de um negócio. O sistema foi projetado com foco em usabilidade, performance e escalabilidade, oferecendo uma interface moderna e intuitiva.

### Características Principais

- ✅ **Interface Moderna**: Design responsivo e intuitivo com tema claro/escuro
- ✅ **Gestão Completa**: Controle total sobre receitas, despesas, patrimônio e processos
- ✅ **Relatórios Avançados**: Dashboard com gráficos e análises detalhadas
- ✅ **Recorrência Inteligente**: Sistema de parcelas e recorrências automáticas
- ✅ **Exportação de Dados**: Exportação para PDF e Excel
- ✅ **Acessibilidade**: Totalmente acessível para leitores de tela

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral financeira completa
- Gráficos interativos de receitas e despesas
- Comparação de períodos
- Análise mensal detalhada
- Projeções financeiras
- Cards de estatísticas em tempo real

### 💰 Gestão Financeira

#### Receitas
- Cadastro de receitas únicas e recorrentes
- Suporte a parcelas mensais e anuais
- Classificação por categoria e tipo
- Vinculação com clientes e imóveis
- Status de documentação
- Exportação para Excel

#### Despesas
- Cadastro de despesas únicas e recorrentes
- Sistema de parcelas flexível
- Categorização completa
- Status de pagamento
- Reutilização de despesas cadastradas

#### Faturamento
- Visualização consolidada por categoria e mês
- Geração automática de parcelas recorrentes
- Tabela dinâmica com scroll horizontal
- Totais por mês e categoria

### 🏠 Gestão Patrimonial

#### Imóveis
- Cadastro completo de imóveis
- Informações de documentação
- Contratos e valores venais
- Reajuste de aluguel
- Geração automática de despesas relacionadas
- Busca por CEP com preenchimento automático

#### Gado
- Controle de lotes de gado
- Categorização e origem
- Status de saúde
- Localização e preço de compra
- Quantidade e idade

### ⚖️ Processos Legais
- Cadastro de processos judiciais
- Vinculação com clientes
- Status e sentenças
- Valores estimados e previsão de pagamento

### 👥 Gestão de Clientes
- Cadastro completo (PF/PJ)
- Validação de CPF/CNPJ
- Formatação automática de telefone
- Histórico e anotações
- Prevenção de duplicatas

### 📝 Organização

#### Anotações
- Sistema de anotações completo
- Marcação de conclusão
- Busca inteligente
- Padronização automática de texto

#### Tarefas
- Sistema de tarefas com prioridades
- Categorização
- Status e prazos
- Notificações de tarefas pendentes
- Recorrência configurável

#### Lembretes
- Sistema de lembretes
- Recorrência personalizada
- Notificações automáticas

### 💳 Empréstimos
- Cadastro de empréstimos
- Vinculação com clientes
- Informações bancárias
- Status e vencimentos

### 🏦 Aplicações Financeiras
- Controle de aplicações
- Taxas de juros e rentabilidade
- Datas de aplicação e vencimento
- Status e instituições

### 🔍 Leads
- Gestão de leads
- Contratos e valores
- Status de negociação
- Prevenção de duplicatas

### 📈 Relatórios
- Relatórios financeiros detalhados
- Exportação para PDF
- Análises comparativas
- Gráficos e visualizações

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3** - Biblioteca JavaScript para interfaces
- **TypeScript 5.8** - Tipagem estática
- **Vite 5.4** - Build tool e dev server
- **React Router DOM 6.30** - Roteamento
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos baseados em Radix UI
- **Recharts 2.15** - Gráficos e visualizações
- **date-fns 3.6** - Manipulação de datas
- **React Query 5.83** - Gerenciamento de estado e cache

### Backend
- **Supabase** - Backend como serviço (BaaS)
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança em nível de linha

### Utilitários
- **jsPDF 3.0** - Geração de PDFs
- **XLSX 0.18** - Exportação para Excel
- **Zod 3.25** - Validação de esquemas
- **Lucide React** - Ícones modernos

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (versão 9 ou superior) ou **yarn**
- Conta no **Supabase** (para banco de dados)
- **Git** (para controle de versão)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/luccavalentin/SISTEMAVANDERLEIVERSAOFINAL.git
cd SISTEMAVANDERLEIVERSAOFINAL
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

**Como obter as credenciais:**
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **URL** e a **anon/public key**

### 4. Configure o banco de dados

Siga as instruções detalhadas no arquivo `INSTRUCOES_BANCO_DADOS.md` para configurar o banco de dados completo.

**Resumo rápido:**
1. Acesse o SQL Editor no Supabase
2. Execute o script: `supabase/migrations/20251116000000_complete_database_setup.sql`
3. Aguarde a confirmação de sucesso

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## ⚙️ Configuração

### Configuração do Banco de Dados

O sistema utiliza o Supabase como backend. Certifique-se de:

1. ✅ Criar um projeto no Supabase
2. ✅ Executar todas as migrations na ordem correta
3. ✅ Configurar as políticas RLS (Row Level Security)
4. ✅ Verificar as conexões das tabelas

**Arquivos importantes:**
- `INSTRUCOES_BANCO_DADOS.md` - Guia completo de configuração
- `supabase/migrations/` - Scripts de migração do banco

### Configuração de Tema

O sistema suporta tema claro/escuro. O tema padrão é claro, mas pode ser alterado através do botão de toggle no sidebar.

## 📁 Estrutura do Projeto

```
SISTEMAVANDERLEIVERSAOFINAL/
├── public/                 # Arquivos estáticos
│   ├── favicon.ico
│   ├── logo.svg
│   └── ...
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── layout/        # Componentes de layout
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── ui/            # Componentes UI (shadcn/ui)
│   │   └── ...
│   ├── pages/             # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Receitas.tsx
│   │   ├── Despesas.tsx
│   │   ├── Faturamento.tsx
│   │   ├── Clientes.tsx
│   │   ├── Imoveis.tsx
│   │   ├── Gado.tsx
│   │   ├── Processos.tsx
│   │   ├── Tarefas.tsx
│   │   ├── Anotacoes.tsx
│   │   ├── Emprestimos.tsx
│   │   ├── Aplicacoes.tsx
│   │   ├── Leads.tsx
│   │   └── ...
│   ├── hooks/             # Custom hooks
│   │   ├── useSmartSearch.tsx
│   │   ├── useTableSort.tsx
│   │   ├── useTaskNotifications.ts
│   │   └── ...
│   ├── lib/               # Utilitários e helpers
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── dateUtils.ts
│   ├── integrations/      # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── data/              # Dados estáticos
│   │   ├── brazilianBanks.ts
│   │   └── brazilianStates.ts
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Entry point
├── supabase/
│   └── migrations/        # Migrations do banco de dados
├── .env                   # Variáveis de ambiente (não commitado)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 💻 Uso

### Navegação

O sistema possui uma sidebar fixa com todas as funcionalidades:

- **Dashboard** - Visão geral do sistema
- **Meu Financeiro**
  - Cadastrar Receita
  - Cadastrar Despesa
  - Faturamento
- **Aplicações** - Gestão de aplicações financeiras
- **Anotações** - Sistema de anotações
- **Clientes** - Gestão de clientes
- **Gado** - Controle de gado
- **Imóveis** - Gestão de imóveis
- **Leads** - Gestão de leads
- **Escritórios e Processos** - Processos legais
- **Tarefas** - Sistema de tarefas
- **Empréstimos** - Gestão de empréstimos
- **Relatórios** - Relatórios financeiros

### Funcionalidades Principais

#### Cadastro de Receitas/Despesas Recorrentes

1. Acesse **Receitas** ou **Despesas**
2. Clique em **Nova Receita/Despesa**
3. Preencha os dados básicos
4. Selecione a **Periodicidade** (Mensal/Anual)
5. Escolha o **Tipo** (Fixo ou Tempo Determinado)
6. Se for Tempo Determinado, informe a quantidade de parcelas
7. Clique em **Cadastrar**

#### Faturamento

O faturamento mostra automaticamente todas as receitas cadastradas, gerando parcelas conforme a periodicidade configurada.

#### Exportação de Dados

- **PDF**: Disponível no Dashboard (botão "Exportar PDF")
- **Excel**: Disponível nas páginas de Receitas e Despesas

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia o servidor de desenvolvimento

# Build
npm run build            # Cria a build de produção
npm run build:dev        # Cria a build de desenvolvimento

# Preview
npm run preview          # Visualiza a build de produção

# Linting
npm run lint             # Executa o linter
```

## 🗄️ Banco de Dados

### Tabelas Principais

- `clients` - Clientes
- `revenue` - Receitas
- `expenses` - Despesas
- `properties` - Imóveis
- `cattle` - Gado
- `legal_processes` - Processos legais
- `reminders` - Tarefas
- `notes` - Anotações
- `loans` - Empréstimos
- `leads` - Leads
- `applications` - Aplicações financeiras

### Migrations

Todas as migrations estão em `supabase/migrations/` e devem ser executadas na ordem cronológica.

**Importante:** Sempre faça backup antes de executar migrations em produção!

## 🔨 Desenvolvimento

### Adicionando Novas Funcionalidades

1. Crie uma nova branch: `git checkout -b feature/nova-funcionalidade`
2. Desenvolva a funcionalidade
3. Teste localmente
4. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

### Padrões de Código

- Use TypeScript para tipagem
- Siga os padrões do ESLint configurado
- Componentes devem ser funcionais com hooks
- Use React Query para gerenciamento de estado do servidor
- Mantenha componentes pequenos e reutilizáveis

### Estrutura de Commits

Seguimos o padrão Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 🤝 Contribuindo

Este é um projeto privado desenvolvido para um cliente específico. Para contribuições:

1. Entre em contato com o desenvolvedor
2. Discuta as mudanças propostas
3. Siga os padrões de código estabelecidos
4. Teste todas as funcionalidades antes de submeter

## 📞 Contato

**Desenvolvedor:** Lucca Valentin  
**Email:** luccasantana88@gmail.com  
**GitHub:** [@luccavalentin](https://github.com/luccavalentin)

## 📄 Licença

Este projeto é **privado** e de uso exclusivo do cliente Vanderlei. Todos os direitos reservados.

---

**Desenvolvido com ❤️ por Lucca Valentin**

*Sistema de Gestão VANDE - Versão 1.0.0*

- 📊 Dashboard com visão geral financeira
- 💰 Gestão de Receitas
- 💸 Gestão de Despesas
- 🏠 Cadastro de Imóveis
- 🐄 Controle de Gado
- ⚖️ Processos Legais
- 👥 Gestão de Clientes
- 📝 Anotações e Lembretes
- 🔍 Sistema de Leads
- 💳 Controle de Empréstimos

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── lib/           # Utilitários e helpers
├── hooks/         # Custom hooks
├── integrations/  # Integrações (Supabase)
└── main.tsx       # Entry point
```

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto é privado e de uso exclusivo.
