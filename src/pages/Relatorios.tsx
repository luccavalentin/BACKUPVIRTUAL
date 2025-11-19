import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Building2,
  Wallet
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency } from "@/lib/validations";
import { formatDateBR } from "@/lib/dateUtils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Função customizada para renderizar labels do gráfico de pizza
function renderCustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, category, value }) {
  if (!value || percent < 0.03) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 32;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN) + index * 18;
  const maxLen = 18;
  const catLabel = category.length > maxLen ? category.slice(0, maxLen) + '...' : category;
  return (
    <g>
      <rect x={x - 2} y={y - 10} width={window.innerWidth < 640 ? 80 : 120} height={window.innerWidth < 640 ? 18 : 22} fill="#fff" opacity={0.85} rx={6} />
      <text
        x={x + 4}
        y={y + 4}
        fill="#222"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={window.innerWidth < 640 ? 10 : 13}
        fontWeight="bold"
        style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 2 }}
      >
        {`${catLabel}: ${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function Relatorios() {
  const { toast } = useToast();
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);

  // Receitas por mês
  const { data: revenueByMonth } = useQuery({
    queryKey: ["revenue-by-month"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, date");
      if (error) throw error;
      
      const monthly = data.reduce((acc: any, item: any) => {
        const month = new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(item.amount);
        return acc;
      }, {});
      
      return Object.entries(monthly).map(([month, amount]) => ({
        month,
        amount: Number(amount)
      })).sort((a, b) => a.month.localeCompare(b.month));
    },
  });

  // Despesas por mês
  const { data: expensesByMonth } = useQuery({
    queryKey: ["expenses-by-month"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, date");
      if (error) throw error;
      
      const monthly = data.reduce((acc: any, item: any) => {
        const month = new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(item.amount);
        return acc;
      }, {});
      
      return Object.entries(monthly).map(([month, amount]) => ({
        month,
        amount: Number(amount)
      })).sort((a, b) => a.month.localeCompare(b.month));
    },
  });

  // Receitas vs Despesas - ordenado por data
  const { data: revenueVsExpenses } = useQuery({
    queryKey: ["revenue-vs-expenses"],
    queryFn: async () => {
      const revenue = revenueByMonth || [];
      const expenses = expensesByMonth || [];
      
      const months = [...new Set([...revenue.map((r: any) => r.month), ...expenses.map((e: any) => e.month)])];
      
      const data = months.map(month => {
        const revAmount = revenue.find((r: any) => r.month === month)?.amount || 0;
        const expAmount = expenses.find((e: any) => e.month === month)?.amount || 0;
        return {
          month,
          receitas: revAmount,
          despesas: expAmount,
          saldo: revAmount - expAmount
        };
      });
      
      // Ordenar por data (converter month para Date para ordenação correta)
      return data.sort((a, b) => {
        // Formato: "jan/2024" -> converter para Date
        const parseMonth = (monthStr: string) => {
          const [month, year] = monthStr.split('/');
          const monthMap: Record<string, number> = {
            'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
          };
          return new Date(parseInt(year), monthMap[month.toLowerCase()] || 0, 1);
        };
        return parseMonth(a.month).getTime() - parseMonth(b.month).getTime();
      });
    },
    enabled: !!revenueByMonth && !!expensesByMonth
  });

  // Receitas por categoria
  const { data: revenueByCategory } = useQuery({
    queryKey: ["revenue-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, category");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        acc[category] += Number(item.amount);
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
  });

  // Despesas por categoria
  const { data: expensesByCategory } = useQuery({
    queryKey: ["expenses-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        acc[category] += Number(item.amount);
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
  });

  // Total de receitas
  const { data: totalRevenue } = useQuery({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("amount");
      if (error) throw error;
      return data.reduce((sum, item) => sum + Number(item.amount), 0);
    },
  });

  // Total de despesas
  const { data: totalExpenses } = useQuery({
    queryKey: ["total-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("amount");
      if (error) throw error;
      return data.reduce((sum, item) => sum + Number(item.amount), 0);
    },
  });

  // Total de imóveis
  const { data: totalProperties } = useQuery({
    queryKey: ["total-properties"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Detalhes de receitas para o dialog
  const { data: revenueDetails } = useQuery({
    queryKey: ["revenue-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: revenueDialogOpen,
  });

  // Detalhes de despesas para o dialog
  const { data: expenseDetails } = useQuery({
    queryKey: ["expense-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: expenseDialogOpen,
  });

  // Detalhes de imóveis para o dialog
  const { data: propertiesDetails } = useQuery({
    queryKey: ["properties-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: propertiesDialogOpen,
  });

  // Total de empréstimos
  const { data: totalLoans } = useQuery({
    queryKey: ["total-loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("amount");
      if (error) throw error;
      return data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    },
  });

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório Financeiro Completo", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Resumo
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Financeiro", margin, yPosition);
      yPosition += 8;

      const summaryData = [
        ["Total de Receitas", formatCurrency(totalRevenue || 0)],
        ["Total de Despesas", formatCurrency(totalExpenses || 0)],
        ["Saldo", formatCurrency(saldo)],
        ["Total de Imóveis", (totalProperties || 0).toString()],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [["Item", "Valor"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Receitas por Categoria
      if (revenueByCategory && revenueByCategory.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Receitas por Categoria", margin, yPosition);
        yPosition += 8;

        const revenueData = revenueByCategory.map((item: any) => [
          item.category || "Sem categoria",
          formatCurrency(item.amount),
          `${((item.amount / (totalRevenue || 1)) * 100).toFixed(1)}%`,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Categoria", "Valor", "Percentual"]],
          body: revenueData,
          theme: "striped",
          headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Despesas por Categoria
      if (expensesByCategory && expensesByCategory.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Despesas por Categoria", margin, yPosition);
        yPosition += 8;

        const expenseData = expensesByCategory.map((item: any) => [
          item.category || "Sem categoria",
          formatCurrency(item.amount),
          `${((item.amount / (totalExpenses || 1)) * 100).toFixed(1)}%`,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Categoria", "Valor", "Percentual"]],
          body: expenseData,
          theme: "striped",
          headStyles: { fillColor: [244, 67, 54], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });
      }

      const fileName = `Relatorio_Financeiro_${format(new Date(), "dd-MM-yyyy")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF exportado com sucesso!",
        description: "O relatório foi salvo no seu dispositivo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao exportar PDF",
        description: error.message || "Ocorreu um erro ao gerar o PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Resumo
      const summaryData = [
        ["Item", "Valor"],
        ["Total de Receitas", totalRevenue || 0],
        ["Total de Despesas", totalExpenses || 0],
        ["Saldo", saldo],
        ["Total de Imóveis", totalProperties || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

      // Receitas por Categoria
      if (revenueByCategory && revenueByCategory.length > 0) {
        const revenueData = revenueByCategory.map((item: any) => ({
          Categoria: item.category || "Sem categoria",
          Valor: item.amount,
          Percentual: `${((item.amount / (totalRevenue || 1)) * 100).toFixed(1)}%`,
        }));
        const wsRevenue = XLSX.utils.json_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(wb, wsRevenue, "Receitas");
      }

      // Despesas por Categoria
      if (expensesByCategory && expensesByCategory.length > 0) {
        const expenseData = expensesByCategory.map((item: any) => ({
          Categoria: item.category || "Sem categoria",
          Valor: item.amount,
          Percentual: `${((item.amount / (totalExpenses || 1)) * 100).toFixed(1)}%`,
        }));
        const wsExpense = XLSX.utils.json_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(wb, wsExpense, "Despesas");
      }

      // Receitas vs Despesas Mensais
      if (revenueVsExpenses && revenueVsExpenses.length > 0) {
        const monthlyData = revenueVsExpenses.map((item: any) => ({
          Mês: item.month,
          Receitas: item.receitas || 0,
          Despesas: item.despesas || 0,
          Saldo: item.saldo || 0,
        }));
        const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(wb, wsMonthly, "Mensal");
      }

      const fileName = `Relatorio_Financeiro_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Excel exportado com sucesso!",
        description: "O relatório foi salvo no seu dispositivo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao exportar Excel",
        description: error.message || "Ocorreu um erro ao gerar o Excel.",
        variant: "destructive",
      });
    }
  };

  const saldo = (totalRevenue || 0) - (totalExpenses || 0);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader 
        title="Relatórios" 
        description="Análises detalhadas e visões gerais do seu negócio"
        showBackButton={false}
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setRevenueDialogOpen(true)}
        >
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
              Total Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-success break-all overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{formatCurrency(totalRevenue || 0)}</p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setExpenseDialogOpen(true)}
        >
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-destructive break-all overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{formatCurrency(totalExpenses || 0)}</p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setBalanceDialogOpen(true)}
        >
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-all overflow-wrap-anywhere ${saldo >= 0 ? 'text-success' : 'text-destructive'}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setPropertiesDialogOpen(true)}
        >
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Total Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{totalProperties || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Exportação */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          onClick={handleExportPDF} 
          className="gap-2 shadow-elegant hover:shadow-elegant-lg bg-primary hover:bg-primary/90"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
        <Button 
          onClick={handleExportExcel} 
          variant="outline" 
          className="gap-2 shadow-sm hover:shadow-elegant border-primary/30 hover:border-primary"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar Excel</span>
          <span className="sm:hidden">Excel</span>
        </Button>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receitas vs Despesas */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col items-center w-full overflow-visible">
              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : 320}>
                <AreaChart data={revenueVsExpenses || []} margin={{ top: 5, right: 10, left: 0, bottom: window.innerWidth < 640 ? 80 : 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 60 : 30}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    width={window.innerWidth < 640 ? 50 : 60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      padding: '8px 12px',
                      fontSize: window.innerWidth < 640 ? '11px' : '13px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receitas" 
                    stackId="1"
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))" 
                    fillOpacity={0.6}
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesas" 
                    stackId="1"
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))" 
                    fillOpacity={0.6}
                    name="Despesas"
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={window.innerWidth < 640 ? 50 : 40}
                    wrapperStyle={{ 
                      paddingTop: window.innerWidth < 640 ? '12px' : '8px',
                      paddingBottom: window.innerWidth < 640 ? '8px' : '0px',
                      fontSize: window.innerWidth < 640 ? '11px' : '13px',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: window.innerWidth < 640 ? '16px' : '20px',
                      flexWrap: 'wrap',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'visible'
                    }}
                    iconType="square"
                    iconSize={window.innerWidth < 640 ? 10 : 12}
                    formatter={(value) => (
                      <span style={{ 
                        fontSize: window.innerWidth < 640 ? '11px' : '13px',
                        fontWeight: '500',
                        color: 'hsl(var(--foreground))',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.5'
                      }}>
                        {value}
                      </span>
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Mensal */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-sm sm:text-base md:text-lg">Saldo Mensal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 300 : 320}>
              <LineChart data={revenueVsExpenses || []} margin={{ top: 5, right: 10, left: 0, bottom: window.innerWidth < 640 ? 60 : 50 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  angle={window.innerWidth < 640 ? -45 : 0}
                  textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                  height={window.innerWidth < 640 ? 60 : 30}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  width={window.innerWidth < 640 ? 50 : 60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    padding: '8px 12px',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={window.innerWidth < 640 ? 2.5 : 3}
                  dot={{ fill: 'hsl(var(--primary))', r: window.innerWidth < 640 ? 3 : 4 }}
                  activeDot={{ r: window.innerWidth < 640 ? 5 : 6 }}
                  name="Saldo Mensal"
                />
                <Legend 
                  verticalAlign="bottom"
                  height={window.innerWidth < 640 ? 40 : 30}
                  wrapperStyle={{ 
                    paddingTop: window.innerWidth < 640 ? '12px' : '8px',
                    paddingBottom: window.innerWidth < 640 ? '8px' : '0px',
                    fontSize: window.innerWidth < 640 ? '11px' : '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'visible'
                  }}
                  iconType="line"
                  iconSize={window.innerWidth < 640 ? 10 : 12}
                  formatter={(value) => (
                    <span style={{ 
                      fontSize: window.innerWidth < 640 ? '11px' : '12px', 
                      fontWeight: '500',
                      color: 'hsl(var(--foreground))',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receitas por Categoria */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-sm sm:text-base md:text-lg">Receitas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : 400}>
              <RechartsPieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
                <Pie
                  data={revenueByCategory || []}
                  cx="50%"
                  cy={window.innerWidth < 640 ? "42%" : "45%"}
                  labelLine={false}
                  label={false}
                  outerRadius={window.innerWidth < 640 ? 75 : window.innerWidth < 768 ? 90 : 110}
                  innerRadius={window.innerWidth < 640 ? 25 : 35}
                  fill="#8884d8"
                  dataKey="amount"
                  paddingAngle={2}
                >
                  {(revenueByCategory || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    padding: '8px 12px',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px'
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    formatCurrency(value),
                    props.payload.category || name
                  ]}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={window.innerWidth < 640 ? 90 : 110}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: window.innerWidth < 640 ? '20px' : '24px',
                    paddingBottom: window.innerWidth < 640 ? '12px' : '8px',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px',
                    fontWeight: '600',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: window.innerWidth < 640 ? '10px' : '14px',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'visible'
                  }}
                  formatter={(value, entry: any) => {
                    const data = entry.payload;
                    const total = revenueByCategory ? revenueByCategory.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
                    const percent = data && total > 0 ? ((data.amount / total) * 100).toFixed(1) : '0';
                    const formattedValue = formatCurrency(data.amount || 0);
                    const categoryName = value || "Sem categoria";
                    return (
                      <span style={{
                        fontSize: window.innerWidth < 640 ? '11px' : '13px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.5',
                        textAlign: 'center'
                      }}>
                        <span>{percent}% de {categoryName}</span>
                        <span style={{ fontWeight: '700', color: 'hsl(var(--muted-foreground))' }}>({formattedValue})</span>
                      </span>
                    );
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              <span className="text-sm sm:text-base md:text-lg">Despesas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : 400}>
              <RechartsPieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
                <Pie
                  data={expensesByCategory || []}
                  cx="50%"
                  cy={window.innerWidth < 640 ? "42%" : "45%"}
                  labelLine={false}
                  label={false}
                  outerRadius={window.innerWidth < 640 ? 75 : window.innerWidth < 768 ? 90 : 110}
                  innerRadius={window.innerWidth < 640 ? 25 : 35}
                  fill="#8884d8"
                  dataKey="amount"
                  paddingAngle={2}
                >
                  {(expensesByCategory || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    padding: '8px 12px',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px'
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    formatCurrency(value),
                    props.payload.category || name
                  ]}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={window.innerWidth < 640 ? 90 : 110}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: window.innerWidth < 640 ? '20px' : '24px',
                    paddingBottom: window.innerWidth < 640 ? '12px' : '8px',
                    fontSize: window.innerWidth < 640 ? '11px' : '13px',
                    fontWeight: '600',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: window.innerWidth < 640 ? '10px' : '14px',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'visible'
                  }}
                  formatter={(value, entry: any) => {
                    const data = entry.payload;
                    const total = expensesByCategory ? expensesByCategory.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
                    const percent = data && total > 0 ? ((data.amount / total) * 100).toFixed(1) : '0';
                    const formattedValue = formatCurrency(data.amount || 0);
                    const categoryName = value || "Sem categoria";
                    return (
                      <span style={{
                        fontSize: window.innerWidth < 640 ? '11px' : '13px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.5',
                        textAlign: 'center'
                      }}>
                        <span>{percent}% de {categoryName}</span>
                        <span style={{ fontWeight: '700', color: 'hsl(var(--muted-foreground))' }}>({formattedValue})</span>
                      </span>
                    );
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Receitas e Despesas Mensais */}
      <Card className="border-0 shadow-elegant mb-6">
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-sm sm:text-base md:text-lg">Análise Mensal Detalhada</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 300 : 400}>
            <BarChart data={revenueVsExpenses || []} margin={{ top: 10, right: 10, left: 0, bottom: window.innerWidth < 640 ? 60 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                height={window.innerWidth < 640 ? 60 : 30}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                width={window.innerWidth < 640 ? 50 : 60}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  padding: '8px 12px',
                  fontSize: window.innerWidth < 640 ? '11px' : '13px'
                }}
                formatter={(value: any) => formatCurrency(value)}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '12px',
                  fontSize: window.innerWidth < 640 ? '11px' : '13px'
                }}
                iconType="square"
                iconSize={12}
                formatter={(value) => (
                  <span style={{ 
                    fontSize: window.innerWidth < 640 ? '11px' : '13px',
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))'
                  }}>
                    {value}
                  </span>
                )}
              />
              <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 20 : 30} />
              <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 20 : 30} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dialogs para detalhes dos cards */}
      <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
              Detalhes de Receitas
            </DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(totalRevenue || 0)} - {revenueDetails?.length || 0} registro(s)
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {revenueDetails && revenueDetails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueDetails.map((revenue: any) => (
                    <TableRow key={revenue.id}>
                      <TableCell>{revenue.description || "-"}</TableCell>
                      <TableCell>{format(new Date(revenue.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{revenue.category || "-"}</TableCell>
                      <TableCell className="font-semibold text-success">{formatCurrency(Number(revenue.amount || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
              Detalhes de Despesas
            </DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(totalExpenses || 0)} - {expenseDetails?.length || 0} registro(s)
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {expenseDetails && expenseDetails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseDetails.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.description || "-"}</TableCell>
                      <TableCell>{format(new Date(expense.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{expense.category || "-"}</TableCell>
                      <TableCell className="font-semibold text-destructive">{formatCurrency(Number(expense.amount || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Detalhes do Saldo
            </DialogTitle>
            <DialogDescription>
              Saldo Total: <span className={`font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(saldo)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-success/10 border-success/30">
                <p className="text-sm text-muted-foreground">Total de Receitas</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalRevenue || 0)}</p>
              </Card>
              <Card className="p-4 bg-destructive/10 border-destructive/30">
                <p className="text-sm text-muted-foreground">Total de Despesas</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses || 0)}</p>
              </Card>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Saldo Mensal</h3>
              {revenueVsExpenses && revenueVsExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Receitas</TableHead>
                      <TableHead>Despesas</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueVsExpenses.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.month}</TableCell>
                        <TableCell className="text-success">{formatCurrency(item.receitas || 0)}</TableCell>
                        <TableCell className="text-destructive">{formatCurrency(item.despesas || 0)}</TableCell>
                        <TableCell className={`font-semibold ${(item.saldo || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(item.saldo || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhum dado disponível.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={propertiesDialogOpen} onOpenChange={setPropertiesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Detalhes de Imóveis
            </DialogTitle>
            <DialogDescription>
              Total: {totalProperties || 0} imóvel(is) cadastrado(s)
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {propertiesDetails && propertiesDetails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Valor Venal</TableHead>
                    <TableHead>Status Documentação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertiesDetails.map((property: any) => (
                    <TableRow key={property.id}>
                      <TableCell>{property.address || "-"}{property.number ? `, ${property.number}` : ""}{property.complement ? ` - ${property.complement}` : ""}</TableCell>
                      <TableCell>{property.city || "-"}</TableCell>
                      <TableCell className="font-semibold text-success">{property.venal_value ? formatCurrency(Number(property.venal_value)) : "-"}</TableCell>
                      <TableCell>
                        {property.documentation_status === "PAGO" ? (
                          <span className="text-success font-semibold">PAGO</span>
                        ) : property.documentation_status === "PENDENTE" ? (
                          <span className="text-destructive font-semibold">PENDENTE</span>
                        ) : (
                          property.documentation_status || "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum imóvel cadastrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

