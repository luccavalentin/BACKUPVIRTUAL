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
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);
  const [customReportOpen, setCustomReportOpen] = useState(false);

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

  // Receitas vs Despesas
  const { data: revenueVsExpenses } = useQuery({
    queryKey: ["revenue-vs-expenses"],
    queryFn: async () => {
      const revenue = revenueByMonth || [];
      const expenses = expensesByMonth || [];
      
      const months = [...new Set([...revenue.map((r: any) => r.month), ...expenses.map((e: any) => e.month)])];
      
      return months.map(month => ({
        month,
        receitas: revenue.find((r: any) => r.month === month)?.amount || 0,
        despesas: expenses.find((e: any) => e.month === month)?.amount || 0,
        saldo: (revenue.find((r: any) => r.month === month)?.amount || 0) - (expenses.find((e: any) => e.month === month)?.amount || 0)
      }));
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

  const handleExportPDF = () => {
    // Implementar exportação para PDF
    alert("Funcionalidade de exportação em PDF será implementada em breve.");
  };

  const handleExportExcel = () => {
    // Implementar exportação para Excel
    alert("Funcionalidade de exportação para Excel será implementada em breve.");
  };

  const saldo = (totalRevenue || 0) - (totalExpenses || 0);

  return (
    <div>
      <button className="btn btn-primary mb-4" onClick={() => setCustomReportOpen(true)}>
        Relatório Personalizado
      </button>
      <Dialog open={customReportOpen} onOpenChange={setCustomReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Relatório Personalizado</DialogTitle>
            <DialogDescription>
              Selecione os filtros e opções desejadas para gerar seu relatório personalizado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <input type="date" className="input input-bordered w-full" placeholder="Data inicial" />
            <input type="date" className="input input-bordered w-full" placeholder="Data final" />
            <select className="select select-bordered w-full">
              <option value="">Categoria</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="aplicacao">Aplicação</option>
            </select>
            <button className="btn btn-success w-full">Gerar Relatório</button>
          </div>
        </DialogContent>
      </Dialog>
      <PageHeader 
        title="Relatórios" 
        description="Análises detalhadas e visões gerais do seu negócio"
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-6">
        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setRevenueDialogOpen(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Total Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-success">{formatCurrency(totalRevenue || 0)}</p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setExpenseDialogOpen(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-destructive">{formatCurrency(totalExpenses || 0)}</p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setBalanceDialogOpen(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold tracking-tight ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 bg-gradient-card cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setPropertiesDialogOpen(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Total Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{totalProperties || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Exportação */}
      <div className="flex gap-4 mb-6">
        <Button onClick={handleExportPDF} className="gap-2 shadow-elegant hover:shadow-elegant-lg">
          <FileText className="w-4 h-4" />
          Exportar PDF
        </Button>
        <Button onClick={handleExportExcel} variant="outline" className="gap-2 shadow-sm hover:shadow-elegant">
          <Download className="w-4 h-4" />
          Exportar Excel
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
          <CardContent>
            <div className="flex flex-col items-center w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueVsExpenses || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
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
                </AreaChart>
              </ResponsiveContainer>
              <div
                className="w-full flex flex-col justify-center items-center gap-2 mt-2 mb-1 px-2"
                style={{
                  maxHeight: '64px',
                  overflow: 'auto',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'hsl(var(--muted-foreground))',
                  textAlign: 'center',
                }}
              >
                <span className="flex items-center gap-2 w-full justify-center">
                  <span style={{ width: 18, height: 18, background: 'hsl(var(--success))', borderRadius: 4, display: 'inline-block' }}></span>
                  <span style={{ whiteSpace: 'nowrap' }}>Receitas</span>
                </span>
                <span className="flex items-center gap-2 w-full justify-center">
                  <span style={{ width: 18, height: 18, background: 'hsl(var(--destructive))', borderRadius: 4, display: 'inline-block' }}></span>
                  <span style={{ whiteSpace: 'nowrap' }}>Despesas</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Mensal */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Saldo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueVsExpenses || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  name="Saldo"
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
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : 300}>
              <RechartsPieChart>
                <Pie
                  data={revenueByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 768 ? 85 : 100}
                  innerRadius={window.innerWidth < 640 ? 20 : 30}
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
                  height={window.innerWidth < 640 ? 80 : 100}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: window.innerWidth < 640 ? '8px' : '12px',
                    fontSize: window.innerWidth < 640 ? '10px' : '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: window.innerWidth < 640 ? '8px' : '12px'
                  }}
                  formatter={(value, entry: any) => {
                    const data = entry.payload;
                    const percent = data && revenueByCategory ? 
                      ((data.amount / revenueByCategory.reduce((sum: number, item: any) => sum + item.amount, 0)) * 100).toFixed(1) : '0';
                    return (
                      <span style={{
                        fontSize: window.innerWidth < 640 ? '10px' : '12px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{value}:</span>
                        <span style={{ fontWeight: '700' }}>{percent}%</span>
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
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : 300}>
              <RechartsPieChart>
                <Pie
                  data={expensesByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 768 ? 85 : 100}
                  innerRadius={window.innerWidth < 640 ? 20 : 30}
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
                  height={window.innerWidth < 640 ? 80 : 100}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: window.innerWidth < 640 ? '8px' : '12px',
                    fontSize: window.innerWidth < 640 ? '10px' : '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: window.innerWidth < 640 ? '8px' : '12px'
                  }}
                  formatter={(value, entry: any) => {
                    const data = entry.payload;
                    const percent = data && expensesByCategory ? 
                      ((data.amount / expensesByCategory.reduce((sum: number, item: any) => sum + item.amount, 0)) * 100).toFixed(1) : '0';
                    return (
                      <span style={{
                        fontSize: window.innerWidth < 640 ? '10px' : '12px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{value}:</span>
                        <span style={{ fontWeight: '700' }}>{percent}%</span>
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
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Análise Mensal Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueVsExpenses || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

