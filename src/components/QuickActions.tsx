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
    <Card className="mb-6 shadow-elegant rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className={`
                  flex flex-col items-center justify-center gap-2 
                  h-auto py-4 px-3 rounded-lg 
                  border border-border/30 
                  transition-all duration-200 
                  hover:scale-[1.02] hover:shadow-md 
                  active:scale-[0.98]
                  focus:ring-2 focus:ring-primary/30 
                  ${action.color}
                `}
                onClick={action.onClick}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background/80 shadow-sm">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
