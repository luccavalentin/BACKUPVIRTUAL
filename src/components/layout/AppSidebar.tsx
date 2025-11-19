import { 
  LayoutDashboard,
  TrendingUp,
  TrendingDown, 
  Wallet,
  Building2, 
  PawPrint,
  Scale, 
  FileCheck, 
  UserCircle, 
  NotebookPen, 
  CheckSquare,
  Settings,
  PiggyBank,
  Receipt,
  ChevronDown,
  Wallet as WalletIcon,
  BarChart3,
  X,
  LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: PiggyBank, label: "Aplicações", path: "/aplicacoes" },
  { icon: NotebookPen, label: "Anotações", path: "/anotacoes" },
  { icon: UserCircle, label: "Clientes", path: "/clientes" },
  { icon: PawPrint, label: "Gado", path: "/gado" },
  { icon: Building2, label: "Imóveis", path: "/imoveis" },
  { icon: FileCheck, label: "Leads", path: "/leads" },
  { icon: Scale, label: "Escritórios e Processos", path: "/processos" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: Wallet, label: "Empréstimos", path: "/emprestimos" },
  // { icon: Settings, label: "Funções Avançadas", path: "/funcoes-avancadas" },
];

const financeiroSubItems = [
  { icon: TrendingUp, label: "Cadastrar Receita", path: "/receitas" },
  { icon: TrendingDown, label: "Cadastrar Despesa", path: "/despesas" },
  { icon: Receipt, label: "Faturamento", path: "/faturamento" },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
  const [isFinanceiroClicked, setIsFinanceiroClicked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handler para logout
  const handleLogout = async () => {
    try {
      // Limpa sessão do Supabase
      await supabase.auth.signOut();
      
      // Limpa dados locais
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      
      // Fecha menu mobile se estiver aberto
      if (onNavigate) {
        onNavigate();
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      // Redireciona para login
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Verifica se algum subitem está ativo para destacar o menu pai
  const isFinanceiroActive = financeiroSubItems.some(item => location.pathname === item.path);

  // Abre automaticamente se algum subitem estiver ativo
  useEffect(() => {
    if (isFinanceiroActive) {
      setIsFinanceiroOpen(true);
      setIsFinanceiroClicked(true);
    }
  }, [isFinanceiroActive]);

  // Limpa o destaque quando navega para um menu que não é do "Meu Financeiro"
  useEffect(() => {
    const isFinanceiroRoute = financeiroSubItems.some(item => location.pathname === item.path);
    if (!isFinanceiroRoute && !isFinanceiroOpen) {
      setIsFinanceiroClicked(false);
    }
  }, [location.pathname, isFinanceiroOpen]);

  // Handler para clicar no menu "Meu Financeiro"
  const handleFinanceiroClick = () => {
    setIsFinanceiroOpen(true);
    setIsFinanceiroClicked(true);
  };

  // Verifica se o menu deve ser destacado (ativo ou quando está aberto e foi clicado)
  const shouldHighlightFinanceiro = isFinanceiroActive || (isFinanceiroClicked && isFinanceiroOpen);

  // Busca nome do usuário
  const userName = localStorage.getItem("userName") || "Usuário";

  return (
    <div className="flex flex-col h-full">
        <div className="p-5 border-b border-sidebar-border/50 bg-sidebar-primary/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-1.61-2.31 0-3.35-.89-3.35-2.56 0-1.51 1.22-2.48 3.12-2.84V6h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.39s3.35.83 3.35 2.61c.01 1.6-1.21 2.48-3.29 2.84z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-base font-bold text-sidebar-foreground tracking-tight leading-tight">
                  Sistema de Gestão VANDE
                </h1>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  Olá, {userName}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 scrollbar-none">
          <ul className="space-y-1.5">
            <li>
              <NavLink
                to="/"
                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/90 transition-colors duration-150 font-medium"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                onClick={onNavigate}
              >
                <div className="relative flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 icon-professional" strokeWidth={2.5} />
                </div>
                <span className="whitespace-nowrap">Dashboard</span>
              </NavLink>
            </li>

            <li>
              <Collapsible open={isFinanceiroOpen} onOpenChange={setIsFinanceiroOpen}>
                <CollapsibleTrigger
                  onClick={handleFinanceiroClick}
                  className={cn(
                    "w-full group flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/90 font-medium",
                    shouldHighlightFinanceiro && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                  )}
                >
                  <WalletIcon className="w-5 h-5 icon-professional" strokeWidth={2.5} />
                  <span className="flex-1 text-left whitespace-nowrap">Meu Financeiro</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-75",
                    isFinanceiroOpen && "transform rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden">
                  <ul className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/50 pl-4 sidebar-submenu">
                    {financeiroSubItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/80 text-sm font-medium"
                          activeClassName=""
                          onClick={onNavigate}
                        >
                          <item.icon className="w-4 h-4 icon-professional" strokeWidth={2.5} />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>

            {menuItems
              .filter(item => item.path !== "/" && item.path !== "/relatorios" && item.path !== "/funcoes-avancadas")
              .map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/90 transition-colors duration-150 font-medium"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                    onClick={onNavigate}
                  >
                    <item.icon className="w-5 h-5 icon-professional" strokeWidth={2.5} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </NavLink>
                </li>
              ))}

            <li>
              <NavLink
                to="/relatorios"
                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/90 transition-colors duration-150 font-medium"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                onClick={onNavigate}
              >
                <BarChart3 className="w-5 h-5 icon-professional" strokeWidth={2.5} />
                <span className="whitespace-nowrap">Relatórios</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Botão de Logout no final do menu */}
        <div className="p-4 border-t border-sidebar-border/50">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-destructive/10 hover:text-destructive transition-colors duration-150 font-medium"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            <span className="whitespace-nowrap">Sair</span>
          </Button>
        </div>
    </div>
  );
};

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Header Mobile com Menu Hambúrguer */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border shadow-lg md:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 relative group hover:bg-sidebar-accent/50 transition-all duration-200"
                >
                  {/* Barrinhas animadas do menu */}
                  <div className="flex flex-col gap-1.5 items-center justify-center w-6 h-6">
                    <span className="block w-6 h-0.5 bg-sidebar-foreground rounded-full transition-all duration-300 group-hover:bg-primary group-hover:w-7 group-hover:translate-y-0.5" />
                    <span className="block w-6 h-0.5 bg-sidebar-foreground rounded-full transition-all duration-300 group-hover:bg-primary group-hover:w-7" />
                    <span className="block w-6 h-0.5 bg-sidebar-foreground rounded-full transition-all duration-300 group-hover:bg-primary group-hover:w-7 group-hover:-translate-y-0.5" />
                  </div>
                  {/* Indicador de pulso */}
                  <span className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 animate-pulse" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
                <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-1.61-2.31 0-3.35-.89-3.35-2.56 0-1.51 1.22-2.48 3.12-2.84V6h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.39s3.35.83 3.35 2.61c.01 1.6-1.21 2.48-3.29 2.84z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight truncate">
                  Sistema de Gestão VANDE
                </h1>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {localStorage.getItem("userName") || "Usuário"}
                </p>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </header>

        {/* Espaçamento para o header fixo */}
        <div className="h-16 md:hidden" />
      </>
    );
  }

  // Desktop: Sidebar fixo
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border shadow-elegant-lg hidden md:block">
      <SidebarContent />
    </aside>
  );
}
