import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, TrendingUp, FileText } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Nova Receita",
      icon: Plus,
      color: "bg-green-500/10 hover:bg-green-500/20",
      onClick: () => navigate("/receitas?novo=1"), // Direct to new entry form
    },
    {
      label: "Nova Despesa",
      icon: Plus,
      color: "bg-red-500/10 hover:bg-red-500/20",
      onClick: () => navigate("/despesas?novo=1"), // Direct to new entry form
    },
    {
      label: "Ver Relatórios",
      icon: FileText,
      color: "bg-blue-500/10 hover:bg-blue-500/20",
      onClick: () => navigate("/relatorios"),
    },
    {
      label: "Aplicações",
      icon: TrendingUp,
      color: "bg-purple-500/10 hover:bg-purple-500/20",
      onClick: () => navigate("/aplicacoes"),
    },
  ];

  return (
    <Card className="mb-4 sm:mb-6 shadow-sm rounded-lg border border-border/40 bg-card">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className={`
                  flex flex-col items-center justify-center gap-1.5 sm:gap-2 
                  h-auto py-3 sm:py-4 px-2 sm:px-3 rounded-lg 
                  border border-border/40 
                  transition-all duration-200 
                  hover:scale-[1.02] hover:shadow-sm hover:border-primary/50
                  active:scale-[0.98]
                  focus:ring-2 focus:ring-primary/30 
                  ${action.color}
                `}
                onClick={action.onClick}
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-background/90 shadow-sm">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight px-1">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
