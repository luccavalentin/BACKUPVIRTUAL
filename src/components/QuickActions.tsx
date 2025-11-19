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
    <Card className="mb-6 shadow-lg rounded-2xl border-0 bg-gradient-to-br from-white to-slate-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-primary">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className={`flex flex-col items-center justify-center gap-2 h-auto py-5 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-primary/40 ${action.color}`}
                onClick={action.onClick}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-inner mb-2">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
