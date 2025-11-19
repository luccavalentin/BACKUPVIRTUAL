# Sistema de Gestão Financeira e Patrimonial

Sistema completo de gestão financeira, patrimonial e de processos desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Tecnologias

- **Frontend:**
  - React 18.3.1
  - TypeScript 5.8.3
  - Vite 5.4.19
  - Tailwind CSS 3.4.17
  - Shadcn UI (componentes baseados em Radix UI)
  - React Router DOM 6.30.1
  - Recharts 2.15.4 (gráficos)
  - React Query 5.83.0 (gerenciamento de estado e cache)
  - Next Themes 0.3.0 (modo claro/escuro)

- **Backend:**
  - Supabase (PostgreSQL, Autenticação, Storage)

- **Bibliotecas Adicionais:**
  - date-fns 3.6.0 (manipulação de datas)
  - jspdf 3.0.3 + jspdf-autotable 5.0.2 (exportação PDF)
  - xlsx 0.18.5 (exportação Excel)
  - React Hook Form 7.61.1 (formulários)
  - Zod 3.25.76 (validação)

## 📋 Pré-requisitos

- Node.js 18+ (recomendado: Node.js 24+)
- npm 11+ ou yarn ou bun
- Conta no Supabase (para banco de dados e autenticação)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/luccavalentin/BACKUPVIRTUAL.git
cd BACKUPVIRTUAL
```

2. **Instale as dependências:**
```bash
npm install
# ou
yarn install
# ou
bun install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute o projeto em modo de desenvolvimento:**
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

5. **Acesse o sistema:**
Abra seu navegador em `http://localhost:5173`

## 🏗️ Build para Produção

```bash
npm run build
# ou
yarn build
# ou
bun build
```

Os arquivos serão gerados na pasta `dist/`.

## 📱 PWA (Progressive Web App)

O sistema é uma PWA completa, permitindo instalação em dispositivos móveis e desktop. Para gerar os ícones necessários:

1. Abra o arquivo `public/icons/gerar-icones.html` no navegador
2. Siga as instruções para gerar os ícones 192x192 e 512x512
3. Salve os ícones na pasta `public/icons/`

## 🔐 Autenticação

O sistema utiliza Supabase Auth para autenticação. Funcionalidades:
- Login com email e senha
- Registro de novos usuários
- Recuperação de senha
- "Lembrar de mim" (persistência de sessão)
- Rotas protegidas

## 📁 Estrutura do Projeto

```
backup2-main/
├── public/              # Arquivos estáticos
│   ├── icons/          # Ícones PWA
│   ├── logo.svg        # Logo do sistema
│   ├── manifest.json   # Manifesto PWA
│   └── service-worker.js # Service Worker
├── src/
│   ├── components/     # Componentes React
│   │   ├── auth/       # Componentes de autenticação
│   │   ├── layout/     # Componentes de layout
│   │   └── ui/         # Componentes UI (Shadcn)
│   ├── hooks/          # Custom hooks
│   ├── integrations/   # Integrações (Supabase)
│   ├── lib/            # Utilitários
│   ├── pages/          # Páginas do sistema
│   └── App.tsx         # Componente principal
├── docs/               # Documentação
│   ├── sql/            # Scripts SQL
│   └── scripts/        # Scripts auxiliares
└── package.json        # Dependências
```

## 🎨 Funcionalidades Principais

- ✅ Dashboard com visão geral financeira
- ✅ Gestão de Receitas e Despesas
- ✅ Controle de Empréstimos
- ✅ Gestão de Clientes
- ✅ Gestão de Imóveis
- ✅ Controle de Gado
- ✅ Processos Jurídicos
- ✅ Gestão de Leads
- ✅ Anotações
- ✅ Sistema de Tarefas
- ✅ Aplicações Financeiras
- ✅ Faturamento Mensal
- ✅ Relatórios Detalhados
- ✅ Exportação PDF e Excel
- ✅ Modo Claro/Escuro
- ✅ Design Responsivo (Mobile e Desktop)
- ✅ PWA (instalável)

## 📚 Documentação Completa

Para informações detalhadas sobre todas as funcionalidades, telas e recursos do sistema, consulte o arquivo [DOCUMENTACAO_SISTEMA.md](./DOCUMENTACAO_SISTEMA.md).

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](./LICENSE).

## 👤 Autor

**Lucca Valentin**
- Email: luccasantana88@gmail.com
- GitHub: [@luccavalentin](https://github.com/luccavalentin)

## 🆘 Suporte

Para suporte, envie um email para luccasantana88@gmail.com ou abra uma issue no repositório.

---

Desenvolvido com ❤️ usando React, TypeScript e Supabase
