# Documentação Completa do Sistema

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivo do Sistema](#objetivo-do-sistema)
3. [Telas e Funcionalidades](#telas-e-funcionalidades)
4. [Recursos Especiais](#recursos-especiais)
5. [Fluxos de Trabalho](#fluxos-de-trabalho)

---

## 🎯 Visão Geral

Sistema completo de gestão financeira, patrimonial e de processos desenvolvido para facilitar o controle e organização de receitas, despesas, patrimônio, processos jurídicos, clientes e muito mais. O sistema oferece uma interface moderna, responsiva e intuitiva, funcionando perfeitamente em dispositivos móveis e desktop.

---

## 🎯 Objetivo do Sistema

O sistema foi desenvolvido para centralizar e automatizar a gestão de:

- **Finanças:** Controle completo de receitas, despesas, empréstimos e aplicações financeiras
- **Patrimônio:** Gestão de imóveis, gado e outros ativos
- **Processos:** Acompanhamento de processos jurídicos e administrativos
- **Relacionamento:** Gestão de clientes, leads e anotações
- **Produtividade:** Sistema de tarefas e lembretes
- **Análise:** Relatórios detalhados e dashboards interativos

---

## 📱 Telas e Funcionalidades

### 1. 🔐 Autenticação

#### Login (`/login`)
- **Funcionalidade:** Autenticação de usuários
- **Recursos:**
  - Login com email e senha
  - Checkbox "Lembrar de mim" para manter sessão ativa
  - Link "Esqueci minha senha" para recuperação
  - Validação de campos em tempo real
  - Mensagens de erro claras
  - Redirecionamento automático para dashboard após login

#### Registro (`/register`)
- **Funcionalidade:** Cadastro de novos usuários
- **Recursos:**
  - Formulário simples (Nome, Email, Senha)
  - Validação de email e força de senha
  - Integração com Supabase Auth
  - Redirecionamento para login após cadastro

#### Recuperação de Senha (`/reset-password`)
- **Funcionalidade:** Redefinição de senha
- **Recursos:**
  - Validação de token de recuperação
  - Formulário para nova senha e confirmação
  - Integração com fluxo de email do Supabase

---

### 2. 📊 Dashboard (`/`)

#### Visão Geral
- **Funcionalidade:** Painel principal com visão consolidada do sistema
- **Recursos:**
  - Cards de resumo: Total de Receitas, Despesas, Saldo, Tarefas Pendentes
  - Gráfico de pizza "Receitas vs Despesas" com legendas detalhadas
  - Gráficos de pizza "Receitas por Categoria" e "Despesas por Categoria"
  - Seção "Balanço Mensal" com valores detalhados
  - Filtros por período (Mensal, Anual, Personalizado)
  - Modo de comparação entre períodos
  - Botões de ação rápida para acesso direto às principais funcionalidades
  - Design totalmente responsivo para mobile e desktop

#### Funcionalidades Especiais:
- **Gráficos Interativos:** Todos os gráficos são clicáveis e mostram informações detalhadas
- **Legendas Claras:** Exibição de percentuais e valores formatados (ex: "44.9% de Serviços (R$ 15.000,00)")
- **Responsividade:** Gráficos se adaptam automaticamente ao tamanho da tela
- **Exportação:** Possibilidade de exportar dados em PDF e Excel

---

### 3. 💰 Receitas (`/receitas`)

#### Funcionalidade Principal
Gerenciamento completo de receitas financeiras.

#### Recursos:
- **Cadastro de Receitas:**
  - Descrição
  - Valor
  - Data
  - Categoria
  - Classificação
  - Status (Pago, Pendente)
  - Frequência (Única, Mensal Fixo, Mensal por Tempo Determinado, Anual Fixo, Anual por Tempo Determinado)
  - Número de parcelas (quando aplicável)
  - Vinculação com Cliente ou Imóvel
  - Status de documentação

- **Visualização:**
  - Tabela completa com todas as receitas
  - Filtros por categoria, status, período
  - Busca inteligente por descrição
  - Ordenação por qualquer coluna
  - Paginação

- **Ações:**
  - Criar nova receita
  - Editar receita existente
  - Excluir receita
  - Visualizar detalhes
  - Exportar para PDF
  - Exportar para Excel

- **Recursos Avançados:**
  - Cálculo automático de parcelas recorrentes
  - Geração automática de receitas futuras baseadas na frequência
  - Validação de campos obrigatórios
  - Formatação automática de valores monetários

---

### 4. 💸 Despesas (`/despesas`)

#### Funcionalidade Principal
Gerenciamento completo de despesas financeiras.

#### Recursos:
- **Cadastro de Despesas:**
  - Descrição
  - Valor
  - Data
  - Categoria
  - Status (Pago, Pendente)
  - Frequência (Única, Mensal Fixo, Mensal por Tempo Determinado, Anual Fixo, Anual por Tempo Determinado)
  - Número de parcelas (quando aplicável)
  - Vinculação com Cliente ou Imóvel
  - Status de documentação

- **Visualização e Ações:**
  - Mesmas funcionalidades da tela de Receitas
  - Filtros, busca, ordenação, paginação
  - Exportação PDF e Excel
  - CRUD completo (Criar, Ler, Atualizar, Excluir)

- **Recursos Avançados:**
  - Cálculo automático de parcelas recorrentes
  - Geração automática de despesas futuras
  - Validação e formatação automática

---

### 5. 🏦 Empréstimos (`/emprestimos`)

#### Funcionalidade Principal
Controle de empréstimos e recebíveis.

#### Recursos:
- **Cadastro de Empréstimos:**
  - Título
  - Descrição
  - Valor
  - Tipo (Empréstimo ou Recebível)
  - Número de parcelas
  - Data da primeira parcela
  - Status
  - Vinculação com Banco (busca de bancos brasileiros)

- **Automações:**
  - **Empréstimos:** Automaticamente gerados como despesas na tabela de despesas
  - **Recebíveis:** Automaticamente gerados como receitas na tabela de receitas
  - Geração automática de parcelas mensais baseadas na data inicial e número de parcelas
  - Criação de registros recorrentes nas tabelas de receitas/despesas

- **Visualização:**
  - Tabela completa com todos os empréstimos
  - Filtros por tipo, status, período
  - Busca inteligente
  - Exportação PDF e Excel

---

### 6. 👥 Clientes (`/clientes`)

#### Funcionalidade Principal
Gestão completa de clientes.

#### Recursos:
- **Cadastro de Clientes:**
  - Nome completo
  - Email
  - Telefone
  - CPF/CNPJ
  - Endereço completo
  - Cidade, Estado, CEP
  - Observações

- **Visualização:**
  - Tabela com todos os clientes
  - Busca inteligente por nome, email, telefone, CPF/CNPJ
  - Filtros avançados
  - Visualização de detalhes completos

- **Integração:**
  - Clientes podem ser vinculados a Receitas, Despesas, Processos e Imóveis
  - Campo de busca com opção de cadastro rápido em outras telas

---

### 7. 🏠 Imóveis (`/imoveis`)

#### Funcionalidade Principal
Gestão completa de imóveis e propriedades.

#### Recursos:
- **Cadastro de Imóveis:**
  - Endereço completo (rua, número, complemento)
  - Cidade, Estado, CEP
  - Valor venal
  - Tipo de imóvel
  - Status de documentação (Pago, Pendente)
  - Inscrição municipal
  - Propriedade de água e energia
  - Datas de contrato (início e fim)
  - Observações

- **Visualização:**
  - Cards de resumo com estatísticas
  - Tabela completa com todos os imóveis
  - Filtros por status, cidade
  - Busca inteligente por endereço, cidade, CEP
  - Visualização de detalhes

- **Ações:**
  - CRUD completo
  - Exportação PDF e Excel
  - Vinculação com Receitas (aluguéis)

---

### 8. 🐄 Gado (`/gado`)

#### Funcionalidade Principal
Controle de gado e lotes.

#### Recursos:
- **Cadastro de Lotes:**
  - Descrição
  - Detalhes
  - Quantidade
  - Valor
  - Data de entrada
  - Observações

- **Controle de Estoque:**
  - **Dar Entrada:** Registro de entrada de gado com quantidade e valor
  - **Saída de Gado:** Registro de saída de gado
  - Opção de gerar receita ou despesa vinculada à movimentação
  - Controle automático de quantidade em estoque

- **Visualização:**
  - Tabela com todos os lotes
  - Filtros e busca
  - Histórico de movimentações
  - Exportação PDF e Excel

---

### 9. ⚖️ Processos (`/processos`)

#### Funcionalidade Principal
Gestão de processos jurídicos e administrativos.

#### Recursos:
- **Cadastro de Processos:**
  - Número do processo
  - Cliente (busca com opção de cadastro rápido)
  - Tipo de processo
  - Valor estimado
  - Opção de parcelamento do valor estimado
  - Número de parcelas (quando parcelado)
  - Opção de gerar como receita recorrente
  - Status
  - Data de início
  - Observações

- **Automações:**
  - Quando marcado como "receita recorrente", gera automaticamente entradas na tabela de receitas
  - Parcelamento automático baseado na configuração

- **Visualização:**
  - Tabela completa
  - Filtros por cliente, status, tipo
  - Busca inteligente
  - Exportação PDF e Excel

---

### 10. 📋 Leads (`/leads`)

#### Funcionalidade Principal
Gestão de leads e oportunidades de negócio.

#### Recursos:
- **Cadastro de Leads:**
  - Nome
  - Email
  - Telefone
  - Origem do lead
  - Status (Novo, Em contato, Convertido, Perdido)
  - Observações
  - Data de cadastro

- **Visualização:**
  - Tabela com todos os leads
  - Filtros por status, origem
  - Busca inteligente
  - Acompanhamento do funil de vendas

---

### 11. 📝 Anotações (`/anotacoes`)

#### Funcionalidade Principal
Sistema de anotações e lembretes.

#### Recursos:
- **Criação de Anotações:**
  - Título
  - Conteúdo (texto livre)
  - Categoria/Tags
  - Data de criação
  - Data de atualização

- **Visualização:**
  - Lista de anotações
  - Busca por título ou conteúdo
  - Filtros por categoria
  - Visualização em cards ou lista

---

### 12. ✅ Tarefas (`/tarefas`)

#### Funcionalidade Principal
Sistema completo de gerenciamento de tarefas.

#### Recursos:
- **Criação de Tarefas:**
  - Título
  - Descrição
  - Prioridade (Baixa, Média, Alta)
  - Status (Pendente, Em andamento, Concluída)
  - Data de vencimento
  - Categoria
  - Observações

- **Funcionalidades:**
  - **Criar nova tarefa:** Formulário completo com todos os campos
  - **Gerenciar tarefas:** Editar, excluir, marcar como concluída
  - **Controlar status:** Acompanhar progresso das tarefas
  - **Filtros:** Por status, prioridade, categoria, data
  - **Busca:** Por título ou descrição
  - **Notificações:** Alertas para tarefas pendentes e próximas do vencimento
  - **Dashboard:** Contador de tarefas pendentes no dashboard principal

- **Visualização:**
  - Tabela com todas as tarefas
  - Cards visuais com cores por prioridade
  - Filtros avançados
  - Ordenação por data, prioridade, status

---

### 13. 💼 Aplicações (`/aplicacoes`)

#### Funcionalidade Principal
Controle de aplicações financeiras e investimentos.

#### Recursos:
- **Cadastro de Aplicações:**
  - Tipo de aplicação
  - Instituição financeira
  - Valor aplicado
  - Taxa de juros
  - Data de aplicação
  - Data de vencimento
  - Status
  - Observações

- **Visualização:**
  - Tabela com todas as aplicações
  - Cálculo de rendimento
  - Filtros por tipo, instituição, status
  - Exportação PDF e Excel

---

### 14. 📊 Faturamento (`/faturamento`)

#### Funcionalidade Principal
Visão consolidada de faturamento mensal por categoria.

#### Recursos:
- **Visualização:**
  - Tabela com receitas agrupadas por categoria
  - Colunas para cada mês
  - Coluna "Total" com fundo sólido destacado
  - Coluna "Descrição" com fundo sólido destacado
  - Linha "TOTAL" com fundo sólido destacado
  - Paginação (10 meses por página no desktop, 3 no mobile)
  - Navegação entre páginas

- **Funcionalidades:**
  - Cálculo automático de totais mensais
  - Cálculo de total geral
  - Considera receitas recorrentes e parceladas
  - Design totalmente responsivo
  - Scroll horizontal em dispositivos móveis

---

### 15. 📈 Relatórios (`/relatorios`)

#### Funcionalidade Principal
Relatórios detalhados e análises financeiras.

#### Recursos:
- **Cards de Resumo (Clicáveis):**
  - **Total de Receitas:** Clique para ver detalhes em tabela
  - **Total de Despesas:** Clique para ver detalhes em tabela
  - **Saldo:** Clique para ver análise detalhada
  - **Total de Imóveis:** Clique para ver lista completa de imóveis

- **Gráficos:**
  - **Receitas vs Despesas:** Gráfico de área mostrando evolução mensal
  - **Saldo Mensal:** Gráfico de linha com saldo mês a mês
  - **Receitas por Categoria:** Gráfico de pizza com percentuais e valores
  - **Despesas por Categoria:** Gráfico de pizza com percentuais e valores
  - Todas as legendas são claras e informativas (ex: "44.9% de Serviços (R$ 15.000,00)")

- **Exportação:**
  - **Exportar PDF:** Gera relatório completo em PDF com todas as informações
  - **Exportar Excel:** Gera planilha Excel com dados detalhados
  - Exportação instantânea e funcional

- **Filtros:**
  - Período (Mensal, Anual, Personalizado)
  - Comparação entre períodos
  - Filtros por categoria

---

### 16. 📥 Importar Dados (`/importar-dados`)

#### Funcionalidade Principal
Importação de dados em lote via arquivo Excel.

#### Recursos:
- Upload de arquivo Excel
- Validação de formato
- Preview dos dados antes de importar
- Mapeamento de colunas
- Confirmação antes de importar
- Relatório de importação (sucessos e erros)

---

## 🎨 Recursos Especiais

### Design e UX
- **Modo Claro/Escuro:** Toggle para alternar entre temas
- **Design Responsivo:** Funciona perfeitamente em mobile, tablet e desktop
- **Scrollbars Visíveis:** Barras de rolagem destacadas com cor primária
- **Animações Suaves:** Transições e efeitos visuais profissionais
- **Feedback Visual:** Toasts e notificações para todas as ações
- **Acessibilidade:** Componentes acessíveis e navegação por teclado

### Performance
- **Cache Inteligente:** React Query para cache de dados
- **Lazy Loading:** Carregamento sob demanda
- **Otimizações:** Código otimizado para performance

### PWA (Progressive Web App)
- **Instalável:** Pode ser instalado como app em dispositivos móveis e desktop
- **Offline:** Funcionalidade básica offline
- **Ícones:** Ícones personalizados para diferentes tamanhos de tela
- **Manifest:** Configuração completa de PWA

### Exportação de Dados
- **PDF:** Exportação profissional com formatação
- **Excel:** Exportação para planilhas com formatação
- **Instantâneo:** Exportação rápida e funcional

### Busca e Filtros
- **Busca Inteligente:** Busca em tempo real em múltiplos campos
- **Filtros Avançados:** Filtros por múltiplos critérios
- **Ordenação:** Ordenação por qualquer coluna
- **Paginação:** Paginação eficiente para grandes volumes de dados

---

## 🔄 Fluxos de Trabalho

### Fluxo de Receitas Recorrentes
1. Usuário cadastra uma receita com frequência "Mensal Fixo"
2. Sistema calcula automaticamente todas as parcelas futuras
3. Receitas aparecem no faturamento mensal automaticamente
4. Usuário pode visualizar todas as parcelas geradas

### Fluxo de Empréstimos
1. Usuário cadastra um empréstimo com número de parcelas
2. Sistema gera automaticamente despesas mensais na tabela de despesas
3. Cada parcela aparece como uma despesa separada
4. Usuário pode acompanhar o pagamento de cada parcela

### Fluxo de Processos com Receita Recorrente
1. Usuário cadastra um processo com valor estimado
2. Marca opção de parcelar e gerar como receita recorrente
3. Sistema gera automaticamente receitas na tabela de receitas
4. Receitas aparecem no faturamento e relatórios

### Fluxo de Tarefas
1. Usuário cria uma tarefa com data de vencimento
2. Sistema exibe notificação no dashboard quando próxima do vencimento
3. Usuário pode marcar como concluída
4. Contador de tarefas pendentes atualiza automaticamente

---

## 📱 Responsividade

O sistema foi desenvolvido com foco total em responsividade:

- **Mobile (< 640px):** Layout adaptado, gráficos redimensionados, tabelas com scroll horizontal
- **Tablet (640px - 1024px):** Layout intermediário otimizado
- **Desktop (> 1024px):** Layout completo com todas as funcionalidades visíveis

### Recursos Responsivos:
- Gráficos se adaptam ao tamanho da tela
- Tabelas com scroll horizontal em mobile
- Botões e campos de toque grandes o suficiente
- Texto legível em todos os tamanhos
- Navegação otimizada para touch

---

## 🔒 Segurança

- Autenticação via Supabase Auth
- Rotas protegidas
- Validação de dados no frontend e backend
- Sanitização de inputs
- Sessões seguras

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- Email: luccasantana88@gmail.com
- GitHub: [@luccavalentin](https://github.com/luccavalentin)

---

**Última atualização:** Dezembro 2024

