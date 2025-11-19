import { useState, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/layout/StatsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskNotificationDialog } from "@/components/TaskNotificationDialog";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { useToast } from "@/hooks/use-toast";
import { QuickActions } from "@/components/QuickActions";
import { 
  DollarSign, 
  TrendingDown, 
  Building2, 
  Scale, 
  PawPrint, 
  AlertCircle,
  TrendingUp,
  Landmark,
  FileCheck,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { PieChart as PieChartIcon, BarChart3, FileText, Download, CalendarIcon, GitCompare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RevenueItem {
  id?: string;
  amount: number;
  date: string;
  frequency?: string;
  installments?: number;
  category?: string;
  classification?: string;
  status?: string;
}

interface ExpenseItem {
  id?: string;
  amount: number;
  date: string;
  frequency?: string;
  installments?: number;
  category?: string;
  status?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasUncompletedTodayTasks, pendingCount, hasUrgentTasks } = useTaskNotifications();
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<"mensal" | "anual" | "personalizado">("mensal");
  // Inicializar com o mês atual
  const getCurrentMonthKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };
  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear());
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsPeriod, setDetailsPeriod] = useState<"period1" | "period2" | null>(null);
  const [detailsType, setDetailsType] = useState<"revenue" | "expense" | null>(null);
  const [comparisonPeriod1, setComparisonPeriod1] = useState<{ dateRange?: { from: Date | undefined; to: Date | undefined }; month?: string; year?: string }>({
    dateRange: { from: undefined, to: undefined },
    month: getCurrentMonthKey().split('-')[1],
    year: getCurrentMonthKey().split('-')[0],
  });
  const [comparisonPeriod2, setComparisonPeriod2] = useState<{ dateRange?: { from: Date | undefined; to: Date | undefined }; month?: string; year?: string }>({
    dateRange: { from: undefined, to: undefined },
    month: getCurrentMonthKey().split('-')[1],
    year: getCurrentMonthKey().split('-')[0],
  });
  
  // Refs para capturar os gráficos
  const pieChartRef = useRef<HTMLDivElement>(null);
  const revenueCategoryChartRef = useRef<HTMLDivElement>(null);
  const expenseCategoryChartRef = useRef<HTMLDivElement>(null);
  const monthlyAnalysisChartRef = useRef<HTMLDivElement>(null);
  
  // Refs para gráficos de comparação
  const comparisonPieChartRef1 = useRef<HTMLDivElement>(null);
  const comparisonPieChartRef2 = useRef<HTMLDivElement>(null);
  const comparisonRevenueCategoryChartRef1 = useRef<HTMLDivElement>(null);
  const comparisonRevenueCategoryChartRef2 = useRef<HTMLDivElement>(null);
  const comparisonExpenseCategoryChartRef1 = useRef<HTMLDivElement>(null);
  const comparisonExpenseCategoryChartRef2 = useRef<HTMLDivElement>(null);

  // Função auxiliar para altura responsiva de gráficos
  // Função auxiliar para altura responsiva de gráficos
  const getChartHeight = () => {
    // Para mobile (sm: < 640px), usar altura menor
    if (window.innerWidth < 640) {
      return 220; // Altura menor para telas muito pequenas
    } else if (window.innerWidth < 768) {
      return 280; // Altura média para tablets/mobile maiores
    }
    return 350; // Altura padrão para desktop
  };

  const getChartMinHeight = () => {
    // Ajustar min-h para ser responsivo, refletindo getChartHeight
    return 'min-h-[220px] sm:min-h-[280px] md:min-h-[350px]';
  };

  // Função para gerar parcelas e calcular apenas as que já passaram
  const calculateRevenueWithInstallments = (revenue: any, today: string) => {
    const frequency = (revenue.frequency || "Única").toString();
    const installmentsCount = revenue.installments ? parseInt(revenue.installments.toString()) : null;
    const startDate = new Date(revenue.date);
    
    // Validar data
    if (isNaN(startDate.getTime())) {
      console.warn("Data inválida para receita:", revenue);
      return 0;
    }
    
    const amount = Number(revenue.amount || 0);
    if (amount <= 0) {
      return 0;
    }
    
    let total = 0;

    // Normalizar frequency para comparação
    const frequencyUpper = frequency.toUpperCase();
    const isMensal = frequencyUpper.includes("MENSAL");
    const isAnual = frequencyUpper.includes("ANUAL");
    const isFixo = frequencyUpper.includes("FIXO");
    const isTempoDeterminado = frequencyUpper.includes("TEMPO DETERMINADO") || frequencyUpper.includes("TEMPO_DETERMINADO");

    // Receita única - apenas se a data já passou
    if (frequency === "Única" || (!isMensal && !isAnual)) {
      if (revenue.date <= today) {
        total += amount;
      }
      return total;
    }

    // Receita mensal
    if (isMensal) {
      if (isFixo) {
        // Mensal Fixo - contar todas as parcelas até hoje
        const todayDate = new Date(today);
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        
        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          total += amount;
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
        // Mensal por Tempo Determinado - contar apenas as parcelas que já passaram
        // Sempre usar dia 1 para evitar problemas com datas inválidas
        for (let i = 0; i < installmentsCount; i++) {
          const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      } else {
        // Fallback para "Mensal" simples - tratar como fixo
        const todayDate = new Date(today);
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        
        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          total += amount;
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      }
    }

    // Receita anual
    if (isAnual) {
      if (isFixo) {
        // Anual Fixo - contar todos os anos até hoje
        const todayDate = new Date(today);
        const startYear = startDate.getFullYear();
        const endYear = todayDate.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const installmentDate = new Date(year, startDate.getMonth(), startDate.getDate());
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
        // Anual por Tempo Determinado - contar apenas as parcelas que já passaram
        for (let i = 0; i < installmentsCount; i++) {
          const installmentDate = new Date(startDate);
          installmentDate.setFullYear(installmentDate.getFullYear() + i);
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      } else {
        // Fallback para "Anual" simples - tratar como fixo
        const todayDate = new Date(today);
        const startYear = startDate.getFullYear();
        const endYear = todayDate.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const installmentDate = new Date(year, startDate.getMonth(), startDate.getDate());
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      }
    }

    return total;
  };

  // Gerar lista de meses disponíveis (15 meses a partir do mês atual)
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    
    // Incluir 15 meses a partir do mês atual
    for (let i = 0; i < 15; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = format(date, "MMMM yyyy", { locale: ptBR });
      months.push({ value: monthKey, label: monthLabel });
    }
    return months;
  };

  // Gerar lista de meses para seleção (1-12)
  const getMonthOptions = () => {
    return [
      { value: "01", label: "Janeiro" },
      { value: "02", label: "Fevereiro" },
      { value: "03", label: "Março" },
      { value: "04", label: "Abril" },
      { value: "05", label: "Maio" },
      { value: "06", label: "Junho" },
      { value: "07", label: "Julho" },
      { value: "08", label: "Agosto" },
      { value: "09", label: "Setembro" },
      { value: "10", label: "Outubro" },
      { value: "11", label: "Novembro" },
      { value: "12", label: "Dezembro" },
    ];
  };

  // Gerar lista de anos disponíveis (ano atual + próximos 3 anos)
  const getAvailableYears = () => {
    const years = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    // Ano atual + próximos 3 anos
    for (let i = 0; i <= 3; i++) {
      const year = currentYear + i;
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  // Função para calcular as datas de início e fim baseado no filtro de comparação
  const getComparisonDateRange = (period: { dateRange?: { from: Date | undefined; to: Date | undefined } }) => {
    const today = new Date();
    
    if (period.dateRange?.from && period.dateRange?.to) {
      return {
        startDate: period.dateRange.from.toISOString().split('T')[0],
        endDate: period.dateRange.to.toISOString().split('T')[0],
      };
    } else if (period.dateRange?.from) {
      // Se só tem data inicial, usar até o final do mês da data inicial ou data futura
      const endDate = period.dateRange.from > today ? 
        new Date(period.dateRange.from.getFullYear(), period.dateRange.from.getMonth() + 1, 0) :
        today;
      return {
        startDate: period.dateRange.from.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    } else {
      // Usar o mês atual
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
      };
    }
  };

  // Função helper para calcular receitas de um período específico
  const calculateRevenueForPeriod = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from("revenue")
      .select("amount, date, frequency, installments");
    if (error) throw error;
    
    const revenueItems: RevenueItem[] = data || [];

    return revenueItems.reduce((sum, item: RevenueItem) => {
      const frequency = (item.frequency || "Única").toString();
      const installmentsCount = item.installments ? parseInt(item.installments.toString()) : null;
      const itemDate = new Date(item.date);
      
      // Validar data
      if (isNaN(itemDate.getTime())) {
        return sum;
      }
      
      const amount = Number(item.amount || 0);
      if (amount <= 0) {
        return sum;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      let periodTotal = 0;

      // Normalizar frequency para comparação
      const frequencyUpper = frequency.toUpperCase();
      const isMensal = frequencyUpper.includes("MENSAL");
      const isAnual = frequencyUpper.includes("ANUAL");
      const isFixo = frequencyUpper.includes("FIXO");
      const isTempoDeterminado = frequencyUpper.includes("TEMPO DETERMINADO") || frequencyUpper.includes("TEMPO_DETERMINADO");

      if (frequency === "Única" || (!isMensal && !isAnual)) {
        if (itemDate >= start && itemDate <= end) {
          periodTotal = amount;
        }
      } else {
        if (isMensal) {
          if (isFixo) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else {
            // Fallback para "Mensal" simples - tratar como fixo
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          }
        } else if (isAnual) {
          if (isFixo) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else {
            // Fallback para "Anual" simples - tratar como fixo
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
      }
      return sum + periodTotal;
    }, 0);
  };

  // Função helper para calcular despesas de um período específico
  const calculateExpenseForPeriod = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("amount, date, frequency, installments");
    if (error) throw error;
    
    return data.reduce((sum, item) => {
      const frequency = (item.frequency || "Única").toString();
      const installmentsCount = item.installments ? parseInt(item.installments.toString()) : null;
      const itemDate = new Date(item.date);
      
      // Validar data
      if (isNaN(itemDate.getTime())) {
        return sum;
      }
      
      const amount = Number(item.amount || 0);
      if (amount <= 0) {
        return sum;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      let periodTotal = 0;

      // Normalizar frequency para comparação
      const frequencyUpper = frequency.toUpperCase();
      const isMensal = frequencyUpper.includes("MENSAL");
      const isAnual = frequencyUpper.includes("ANUAL");
      const isFixo = frequencyUpper.includes("FIXO");
      const isTempoDeterminado = frequencyUpper.includes("TEMPO DETERMINADO") || frequencyUpper.includes("TEMPO_DETERMINADO");

      if (frequency === "Única" || (!isMensal && !isAnual)) {
        if (itemDate >= start && itemDate <= end) {
          periodTotal = amount;
        }
      } else {
        if (isMensal) {
          if (isFixo) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else {
            // Fallback para "Mensal" simples - tratar como fixo
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          }
        } else if (isAnual) {
          if (isFixo) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else {
            // Fallback para "Anual" simples - tratar como fixo
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
      }
      return sum + periodTotal;
    }, 0);
  };

  // Função para calcular as datas de início e fim baseado no filtro
  const getDateRange = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (periodFilter === "mensal") {
      if (selectedMonth) {
        // Formato: "2025-11"
        const [year, month] = selectedMonth.split('-');
        const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
        const yearNum = parseInt(year);
        const startOfMonth = new Date(yearNum, monthNum, 1);
        const endOfMonth = new Date(yearNum, monthNum + 1, 0); // Last day of month
        // Para períodos futuros, permitir calcular até o final do mês
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
        };
      } else {
        // Se nenhum mês selecionado, não mostrar dados (retornar período inválido)
        return {
          startDate: "2099-12-31", // Data futura para não retornar dados
          endDate: "2099-12-31",
        };
      }
    } else if (periodFilter === "anual") {
      if (selectedYear) {
        const yearNum = parseInt(selectedYear);
        const startOfYear = new Date(yearNum, 0, 1);
        const endOfYear = new Date(yearNum, 11, 31);
        // Para períodos futuros, permitir calcular até o final do ano
        return {
          startDate: startOfYear.toISOString().split('T')[0],
          endDate: endOfYear.toISOString().split('T')[0],
        };
      } else {
        // Se nenhum ano selecionado, usar o ano atual
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        return {
          startDate: startOfYear.toISOString().split('T')[0],
          endDate: endOfYear.toISOString().split('T')[0],
        };
      }
    } else {
      // Personalizado
      if (customDateRange.from && customDateRange.to) {
        return {
          startDate: customDateRange.from.toISOString().split('T')[0],
          endDate: customDateRange.to.toISOString().split('T')[0],
        };
      } else if (customDateRange.from) {
        // Se só tem data inicial, usar até o final do mês atual ou data futura se for futuro
        const endDate = customDateRange.from > today ? 
          new Date(customDateRange.from.getFullYear(), customDateRange.from.getMonth() + 1, 0) :
          today;
        return {
          startDate: customDateRange.from.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };
      } else {
        // Se nenhuma data selecionada, usar o mês atual
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
        };
      }
    }
  };

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-total", periodFilter, selectedMonth, selectedYear, customDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Buscar todas as receitas que podem ter parcelas dentro do período
      // Isso inclui receitas que começaram antes do período mas são recorrentes
      // Buscar: receitas únicas dentro do período OU receitas recorrentes que começaram antes ou durante o período
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, date, frequency, installments");
      if (error) throw error;
      
      return data.reduce((sum, item) => {
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        // Receita única - apenas se está dentro do período
        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else {
          // Receita recorrente - calcular apenas parcelas dentro do período
          if (frequency.includes("Mensal")) {
            if (frequency.includes("Fixo")) {
              // Mensal Fixo - contar apenas meses dentro do período
              // Começar do primeiro mês que pode ter parcela dentro do período
              let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
              currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
              
              while (currentMonth <= endMonth) {
                const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                // Verificar se este mês está dentro do período
                if (monthStart <= end && monthEnd >= start) {
                  periodTotal += amount;
                }
                currentMonth.setMonth(currentMonth.getMonth() + 1);
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            }
          } else if (frequency.includes("Anual")) {
            if (frequency.includes("Fixo")) {
              // Anual Fixo - contar apenas anos dentro do período
              const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
              const endYear = end.getFullYear();
              for (let year = startYear; year <= endYear; year++) {
                const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemDate);
                installmentDate.setFullYear(installmentDate.getFullYear() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            }
          }
        }
        return sum + periodTotal;
      }, 0);
    },
  });

  // Função para gerar parcelas de despesas e calcular apenas as que já passaram
  const calculateExpenseWithInstallments = (expense: any, today: string) => {
    const frequency = expense.frequency || "Única";
    const installmentsCount = expense.installments || null;
    const startDate = new Date(expense.date);
    const amount = Number(expense.amount || 0);
    let total = 0;

    // Despesa única - apenas se a data já passou
    if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
      if (expense.date <= today) {
        total += amount;
      }
      return total;
    }

    // Despesa mensal
    if (frequency.includes("Mensal")) {
      if (frequency.includes("Fixo")) {
        // Mensal Fixo - contar todas as parcelas até hoje
        const todayDate = new Date(today);
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        
        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          total += amount;
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
        // Mensal por Tempo Determinado - contar apenas as parcelas que já passaram
        // Sempre usar dia 1 para evitar problemas com datas inválidas
        for (let i = 0; i < installmentsCount; i++) {
          const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      }
    }

    // Despesa anual
    if (frequency.includes("Anual")) {
      if (frequency.includes("Fixo")) {
        // Anual Fixo - contar todos os anos até hoje
        const todayDate = new Date(today);
        const startYear = startDate.getFullYear();
        const endYear = todayDate.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const installmentDate = new Date(year, startDate.getMonth(), startDate.getDate());
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
        // Anual por Tempo Determinado - contar apenas as parcelas que já passaram
        for (let i = 0; i < installmentsCount; i++) {
          const installmentDate = new Date(startDate);
          installmentDate.setFullYear(installmentDate.getFullYear() + i);
          const installmentDateStr = installmentDate.toISOString().split('T')[0];
          
          if (installmentDateStr <= today) {
            total += amount;
          }
        }
      }
    }

    return total;
  };

  // Queries para período de comparação 1
  const { data: comparisonRevenue1 } = useQuery({
    queryKey: ["comparison-revenue-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      return await calculateRevenueForPeriod(startDate, endDate);
    },
    enabled: comparisonMode,
  });

  const { data: comparisonExpense1 } = useQuery({
    queryKey: ["comparison-expense-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      return await calculateExpenseForPeriod(startDate, endDate);
    },
    enabled: comparisonMode,
  });

  // Queries para período de comparação 2
  const { data: comparisonRevenue2 } = useQuery({
    queryKey: ["comparison-revenue-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      return await calculateRevenueForPeriod(startDate, endDate);
    },
    enabled: comparisonMode,
  });

  const { data: comparisonExpense2 } = useQuery({
    queryKey: ["comparison-expense-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      return await calculateExpenseForPeriod(startDate, endDate);
    },
    enabled: comparisonMode,
  });

  // Queries para receitas detalhadas por período
  const { data: comparisonRevenueDetails1 } = useQuery({
    queryKey: ["comparison-revenue-details-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      
      // Filtrar e calcular parcelas dentro do período
      return data.filter((item: any) => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const frequency = item.frequency || "Única";
        
        if (frequency === "Única") {
          return itemDate >= start && itemDate <= end;
        }
        
        // Para recorrentes, verificar se tem parcelas no período
        if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            return currentMonth <= endMonth;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            return startYear <= endYear;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        }
        return false;
      });
    },
    enabled: comparisonMode,
  });

  const { data: comparisonRevenueDetails2 } = useQuery({
    queryKey: ["comparison-revenue-details-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      
      return data.filter((item: any) => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const frequency = item.frequency || "Única";
        
        if (frequency === "Única") {
          return itemDate >= start && itemDate <= end;
        }
        
        if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            return currentMonth <= endMonth;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            return startYear <= endYear;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        }
        return false;
      });
    },
    enabled: comparisonMode,
  });

  // Queries para despesas detalhadas por período
  const { data: comparisonExpenseDetails1 } = useQuery({
    queryKey: ["comparison-expense-details-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      
      return data.filter((item: any) => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const frequency = item.frequency || "Única";
        
        if (frequency === "Única") {
          return itemDate >= start && itemDate <= end;
        }
        
        if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            return currentMonth <= endMonth;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            return startYear <= endYear;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        }
        return false;
      });
    },
    enabled: comparisonMode,
  });

  const { data: comparisonExpenseDetails2 } = useQuery({
    queryKey: ["comparison-expense-details-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      
      return data.filter((item: any) => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const frequency = item.frequency || "Única";
        
        if (frequency === "Única") {
          return itemDate >= start && itemDate <= end;
        }
        
        if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            return currentMonth <= endMonth;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            return startYear <= endYear;
          } else if (frequency.includes("Tempo Determinado") && item.installments) {
            for (let i = 0; i < item.installments; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              if (installmentDate >= start && installmentDate <= end) return true;
            }
          }
        }
        return false;
      });
    },
    enabled: comparisonMode,
  });

  // Queries para receitas por categoria por período de comparação
  const { data: comparisonRevenueByCategory1 } = useQuery({
    queryKey: ["comparison-revenue-category-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
    enabled: comparisonMode,
  });

  const { data: comparisonRevenueByCategory2 } = useQuery({
    queryKey: ["comparison-revenue-category-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
    enabled: comparisonMode,
  });

  // Queries para despesas por categoria por período de comparação
  const { data: comparisonExpensesByCategory1 } = useQuery({
    queryKey: ["comparison-expenses-category-1", comparisonPeriod1],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod1);
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
    enabled: comparisonMode,
  });

  const { data: comparisonExpensesByCategory2 } = useQuery({
    queryKey: ["comparison-expenses-category-2", comparisonPeriod2],
    queryFn: async () => {
      const { startDate, endDate } = getComparisonDateRange(comparisonPeriod2);
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
    enabled: comparisonMode,
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses-total", periodFilter, selectedMonth, selectedYear, customDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Buscar todas as despesas que podem ter parcelas dentro do período
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, date, frequency, installments");
      if (error) throw error;
      
      return data.reduce((sum, item) => {
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        // Despesa única - apenas se está dentro do período
        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else {
          // Despesa recorrente - calcular apenas parcelas dentro do período
          if (frequency.includes("Mensal")) {
            if (frequency.includes("Fixo")) {
              // Mensal Fixo - contar apenas meses dentro do período
              // Começar do primeiro mês que pode ter parcela dentro do período
              let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
              currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
              
              while (currentMonth <= endMonth) {
                const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                // Verificar se este mês está dentro do período
                if (monthStart <= end && monthEnd >= start) {
                  periodTotal += amount;
                }
                currentMonth.setMonth(currentMonth.getMonth() + 1);
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            }
          } else if (frequency.includes("Anual")) {
            if (frequency.includes("Fixo")) {
              // Anual Fixo - contar apenas anos dentro do período
              const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
              const endYear = end.getFullYear();
              for (let year = startYear; year <= endYear; year++) {
                const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemDate);
                installmentDate.setFullYear(installmentDate.getFullYear() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                  periodTotal += amount;
                }
              }
            }
          }
        }
        return sum + periodTotal;
      }, 0);
    },
  });

  // Projeção de Receita (baseada na média dos últimos 3 meses)
  const { data: revenueProjection } = useQuery({
    queryKey: ["revenue-projection"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, date")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      // Agrupar por mês e somar total mensal
      const monthly = data.reduce((acc: any, item: any) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += Number(item.amount);
        return acc;
      }, {});
      
      // Pegar os últimos 3 meses
      const monthlyArray = Object.entries(monthly)
        .map(([month, total]: [string, any]) => ({
          month,
          total: Number(total)
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 3);
      
      if (monthlyArray.length === 0) return 0;
      
      // Calcular média do total mensal dos últimos 3 meses
      const average = monthlyArray.reduce((sum, item) => sum + item.total, 0) / monthlyArray.length;
      return average;
    },
  });

  // Projeção de Despesa (baseada na média dos últimos 3 meses)
  const { data: expenseProjection } = useQuery({
    queryKey: ["expense-projection"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, date")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      // Agrupar por mês e somar total mensal
      const monthly = data.reduce((acc: any, item: any) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += Number(item.amount);
        return acc;
      }, {});
      
      // Pegar os últimos 3 meses
      const monthlyArray = Object.entries(monthly)
        .map(([month, total]: [string, any]) => ({
          month,
          total: Number(total)
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 3);
      
      if (monthlyArray.length === 0) return 0;
      
      // Calcular média do total mensal dos últimos 3 meses
      const average = monthlyArray.reduce((sum, item) => sum + item.total, 0) / monthlyArray.length;
      return average;
    },
  });

  // Receitas por categoria
  const { data: revenueByCategory } = useQuery({
    queryKey: ["revenue-by-category", periodFilter, selectedMonth, selectedYear, customDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Buscar todas as receitas que podem ter parcelas dentro do período
      const { data, error } = await supabase
        .from("revenue")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        // Calcular apenas parcelas dentro do período
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            // Mensal Fixo - contar apenas meses dentro do período
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
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
    queryKey: ["expenses-by-category", periodFilter, selectedMonth, selectedYear, customDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Buscar todas as despesas que podem ter parcelas dentro do período
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category, date, frequency, installments");
      if (error) throw error;
      
      const byCategory = data.reduce((acc: any, item: any) => {
        const category = item.category || "Sem categoria";
        if (!acc[category]) acc[category] = 0;
        // Calcular apenas parcelas dentro do período
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);
        let periodTotal = 0;

        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (itemDate >= start && itemDate <= end) {
            periodTotal = amount;
          }
        } else if (frequency.includes("Mensal")) {
          if (frequency.includes("Fixo")) {
            // Mensal Fixo - contar apenas meses dentro do período
            let currentMonth = new Date(Math.max(start.getTime(), itemDate.getTime()));
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
            while (currentMonth <= endMonth) {
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
              if (monthStart <= end && monthEnd >= start) {
                periodTotal += amount;
              }
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        } else if (frequency.includes("Anual")) {
          if (frequency.includes("Fixo")) {
            const startYear = Math.max(start.getFullYear(), itemDate.getFullYear());
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
              const installmentDate = new Date(year, itemDate.getMonth(), itemDate.getDate());
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
            for (let i = 0; i < installmentsCount; i++) {
              const installmentDate = new Date(itemDate);
              installmentDate.setFullYear(installmentDate.getFullYear() + i);
              const installmentDateStr = installmentDate.toISOString().split('T')[0];
              if (installmentDateStr >= startDate && installmentDateStr <= endDate) {
                periodTotal += amount;
              }
            }
          }
        }
        acc[category] += periodTotal;
        return acc;
      }, {});
      
      return Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Number(amount)
      })).sort((a, b) => b.amount - a.amount);
    },
  });

  // Dados para análise mensal detalhada (Receitas e Despesas por mês)
  const { data: monthlyAnalysisData } = useQuery({
    queryKey: ["monthly-analysis", periodFilter, selectedMonth, selectedYear, customDateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      // Buscar receitas
      const { data: revenues, error: revenueError } = await supabase
        .from("revenue")
        .select("amount, date, frequency, installments")
        .order("date", { ascending: true });
      if (revenueError) throw revenueError;

      // Buscar despesas
      const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select("amount, date, frequency, installments")
        .order("date", { ascending: true });
      if (expenseError) throw expenseError;

      // Agrupar receitas por mês (considerando parcelas)
      const revenueByMonth: Record<string, number> = {};
      revenues?.forEach((item: any) => {
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemStartDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Receita única
        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (item.date <= endDate && itemStartDate >= start) {
            const monthKey = format(itemStartDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
            if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
            revenueByMonth[monthKey] += amount;
          }
        } else {
          // Receita recorrente - gerar parcelas
          if (frequency.includes("Mensal")) {
            if (frequency.includes("Fixo")) {
              const endDateObj = new Date(endDate);
              const startMonthDate = new Date(Math.max(itemStartDate.getTime(), start.getTime()));
              const startMonth = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth(), 1);
              const endMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), 1);
              
              let currentMonth = new Date(startMonth);
              while (currentMonth <= endMonth && currentMonth <= end) {
                const monthKey = format(currentMonth, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
                revenueByMonth[monthKey] += amount;
                currentMonth.setMonth(currentMonth.getMonth() + 1);
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemStartDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
                  revenueByMonth[monthKey] += amount;
                }
              }
            }
          } else if (frequency.includes("Anual")) {
            if (frequency.includes("Fixo")) {
              const endDateObj = new Date(endDate);
              const startYear = Math.max(itemStartDate.getFullYear(), start.getFullYear());
              const endYear = endDateObj.getFullYear();
              
              for (let year = startYear; year <= endYear; year++) {
                const installmentDate = new Date(year, itemStartDate.getMonth(), itemStartDate.getDate());
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
                  revenueByMonth[monthKey] += amount;
                }
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemStartDate);
                installmentDate.setFullYear(installmentDate.getFullYear() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
                  revenueByMonth[monthKey] += amount;
                }
              }
            }
          }
        }
      });

      // Agrupar despesas por mês (considerando parcelas)
      const expenseByMonth: Record<string, number> = {};
      expenses?.forEach((item: any) => {
        const frequency = item.frequency || "Única";
        const installmentsCount = item.installments || null;
        const itemStartDate = new Date(item.date);
        const amount = Number(item.amount || 0);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Despesa única
        if (frequency === "Única" || (!frequency.includes("Mensal") && !frequency.includes("Anual"))) {
          if (item.date <= endDate && itemStartDate >= start) {
            const monthKey = format(itemStartDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
            if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
            expenseByMonth[monthKey] += amount;
          }
        } else {
          // Despesa recorrente - gerar parcelas
          if (frequency.includes("Mensal")) {
            if (frequency.includes("Fixo")) {
              const endDateObj = new Date(endDate);
              const startMonthDate = new Date(Math.max(itemStartDate.getTime(), start.getTime()));
              const startMonth = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth(), 1);
              const endMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), 1);
              
              let currentMonth = new Date(startMonth);
              while (currentMonth <= endMonth && currentMonth <= end) {
                const monthKey = format(currentMonth, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
                expenseByMonth[monthKey] += amount;
                currentMonth.setMonth(currentMonth.getMonth() + 1);
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemStartDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
                  expenseByMonth[monthKey] += amount;
                }
              }
            }
          } else if (frequency.includes("Anual")) {
            if (frequency.includes("Fixo")) {
              const endDateObj = new Date(endDate);
              const startYear = Math.max(itemStartDate.getFullYear(), start.getFullYear());
              const endYear = endDateObj.getFullYear();
              
              for (let year = startYear; year <= endYear; year++) {
                const installmentDate = new Date(year, itemStartDate.getMonth(), itemStartDate.getDate());
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
                  expenseByMonth[monthKey] += amount;
                }
              }
            } else if (frequency.includes("Tempo Determinado") && installmentsCount) {
              for (let i = 0; i < installmentsCount; i++) {
                const installmentDate = new Date(itemStartDate);
                installmentDate.setFullYear(installmentDate.getFullYear() + i);
                const installmentDateStr = installmentDate.toISOString().split('T')[0];
                
                if (installmentDateStr <= endDate && installmentDate >= start) {
                  const monthKey = format(installmentDate, "MMM/yyyy", { locale: ptBR }).toUpperCase();
                  if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
                  expenseByMonth[monthKey] += amount;
                }
              }
            }
          }
        }
      });

      // Combinar todos os meses únicos
      const allMonths = new Set([
        ...Object.keys(revenueByMonth),
        ...Object.keys(expenseByMonth)
      ]);

      // Criar array de dados ordenado
      const chartData = Array.from(allMonths)
        .map(month => {
          // Converter MMM/yyyy para Date para ordenar corretamente
          const [monthName, year] = month.split('/');
          const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
          const monthIndex = monthNames.indexOf(monthName);
          const date = new Date(parseInt(year), monthIndex, 1);
          
          return {
            month,
            receitas: revenueByMonth[month] || 0,
            despesas: expenseByMonth[month] || 0,
            sortDate: date,
          };
        })
        .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
        .map(({ sortDate, ...rest }) => rest); // Remover sortDate do resultado final

      return chartData;
    },
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  // Dados para gráfico de Receitas vs Despesas por mês
  const { data: revenueVsExpensesData } = useQuery({
    queryKey: ["revenue-vs-expenses-monthly"],
    queryFn: async () => {
      // Buscar receitas
      const { data: revenues, error: revenueError } = await supabase
        .from("revenue")
        .select("amount, date")
        .order("date", { ascending: true });
      if (revenueError) throw revenueError;

      // Buscar despesas
      const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select("amount, date")
        .order("date", { ascending: true });
      if (expenseError) throw expenseError;

      // Agrupar receitas por mês
      const revenueByMonth: Record<string, number> = {};
      revenues?.forEach((item: any) => {
        const date = new Date(item.date);
        const monthKey = format(date, "MMM/yyyy", { locale: ptBR }).toUpperCase();
        if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
        revenueByMonth[monthKey] += Number(item.amount || 0);
      });

      // Agrupar despesas por mês
      const expenseByMonth: Record<string, number> = {};
      expenses?.forEach((item: any) => {
        const date = new Date(item.date);
        const monthKey = format(date, "MMM/yyyy", { locale: ptBR }).toUpperCase();
        if (!expenseByMonth[monthKey]) expenseByMonth[monthKey] = 0;
        expenseByMonth[monthKey] += Number(item.amount || 0);
      });

      // Combinar todos os meses únicos
      const allMonths = new Set([
        ...Object.keys(revenueByMonth),
        ...Object.keys(expenseByMonth)
      ]);

      // Criar array de dados ordenado
      const chartData = Array.from(allMonths)
        .map(month => {
          // Converter MMM/yyyy para Date para ordenar corretamente
          const [monthName, year] = month.split('/');
          const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
          const monthIndex = monthNames.indexOf(monthName);
          const date = new Date(parseInt(year), monthIndex, 1);
          
          return {
            name: month,
            Receitas: revenueByMonth[month] || 0,
            Despesas: expenseByMonth[month] || 0,
            sortDate: date,
          };
        })
        .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
        .map(({ sortDate, ...rest }) => rest); // Remover sortDate do resultado final

      // Garantir que sempre há pelo menos um ponto com valor 0 para forçar o eixo começar em 0
      if (chartData.length === 0) {
        return [{
          name: format(new Date(), "MMM/yyyy", { locale: ptBR }).toUpperCase(),
          Receitas: 0,
          Despesas: 0,
        }];
      }

      return chartData;
    },
  });

  const { data: propertiesCount } = useQuery({
    queryKey: ["properties-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: processesCount } = useQuery({
    queryKey: ["processes-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("legal_processes")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: cattleCount } = useQuery({
    queryKey: ["cattle-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cattle")
        .select("quantity");
      if (error) throw error;
      return data.reduce((sum, item) => sum + item.quantity, 0);
    },
  });

  // Buscar tarefas pendentes para o dialog
  const { data: pendingTasks } = useQuery({
    queryKey: ["pending-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      
      // Filtrar apenas pendentes
      return data.filter((task: any) => {
        const status = task.status || (task.completed ? "concluida" : "pendente");
        return status !== "concluida";
      });
    },
    enabled: tasksDialogOpen, // Só busca quando o dialog está aberto
  });


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      
      // Função auxiliar para verificar se precisa de nova página
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Obter informações do período filtrado
      const { startDate, endDate } = getDateRange();
      let periodLabel = "";
      
      if (periodFilter === "mensal" && selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                           "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        periodLabel = `${monthNames[parseInt(month) - 1]} de ${year}`;
      } else if (periodFilter === "anual" && selectedYear) {
        periodLabel = `Ano ${selectedYear}`;
      } else if (periodFilter === "personalizado" && customDateRange.from && customDateRange.to) {
        periodLabel = `${format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })} até ${format(customDateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
      } else {
        periodLabel = "Período atual";
      }

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Dashboard Financeiro", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      // Período filtrado
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Período: ${periodLabel}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 6;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Resumo Financeiro
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Financeiro", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryData = [
        ["Total de Receitas", formatCurrency(revenueData || 0)],
        ["Total de Despesas", formatCurrency(expensesData || 0)],
        ["Saldo", formatCurrency((revenueData || 0) - (expensesData || 0))],
        ["Tarefas Pendentes", `${pendingCount || 0}`],
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
        checkPageBreak(50);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Receitas por Categoria", margin, yPosition);
        yPosition += 8;

        const revenueCategoryData = revenueByCategory.map((item: any) => [
          item.category || "Sem categoria",
          formatCurrency(item.amount),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Categoria", "Valor"]],
          body: revenueCategoryData,
          theme: "striped",
          headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Despesas por Categoria
      if (expensesByCategory && expensesByCategory.length > 0) {
        checkPageBreak(50);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Despesas por Categoria", margin, yPosition);
        yPosition += 8;

        const expenseCategoryData = expensesByCategory.map((item: any) => [
          item.category || "Sem categoria",
          formatCurrency(item.amount),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Categoria", "Valor"]],
          body: expenseCategoryData,
          theme: "striped",
          headStyles: { fillColor: [244, 67, 54], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 10 },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Análise Mensal Detalhada
      if (monthlyAnalysisData && monthlyAnalysisData.length > 0) {
        checkPageBreak(80);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Análise Mensal Detalhada", margin, yPosition);
        yPosition += 8;

        const monthlyData = monthlyAnalysisData.map((item: any) => [
          item.month || "-",
          formatCurrency(item.receitas || 0),
          formatCurrency(item.despesas || 0),
          formatCurrency((item.receitas || 0) - (item.despesas || 0)),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Mês", "Receitas", "Despesas", "Saldo"]],
          body: monthlyData,
          theme: "striped",
          headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin },
          columnStyles: {
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Salvar PDF
      const fileName = `Dashboard_${format(new Date(), "yyyy-MM-dd_HH-mm", { locale: ptBR })}.pdf`;
      doc.save(fileName);
      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message || "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <TaskNotificationDialog />
      <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 md:mb-10 relative w-full max-w-full px-2 sm:px-4">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="relative z-10 w-full max-w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-2 sm:mb-3">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed mb-3 sm:mb-4">
            Visão geral do seu negócio
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-2 md:gap-3 mb-4 sm:mb-6 flex-wrap w-full max-w-full px-2">
            <Select value={periodFilter} onValueChange={(value) => {
              setPeriodFilter(value as "mensal" | "anual" | "personalizado");
              // Resetar seleções ao mudar o tipo de filtro
              setSelectedMonth("");
              setSelectedYear("");
              setCustomDateRange({ from: undefined, to: undefined });
            }}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-11 sm:h-12 rounded-2xl border-2 border-primary/20 bg-white/85 shadow-[0_8px_24px_rgba(9,9,121,0.08)] hover:border-primary/40 hover:bg-white transition-all duration-300 text-sm sm:text-base font-semibold text-foreground/90">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {periodFilter === "mensal" && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[200px] md:w-[220px] h-11 sm:h-12 rounded-2xl border-2 border-primary/20 bg-white/85 shadow-[0_8px_24px_rgba(9,9,121,0.08)] hover:border-primary/40 hover:bg-white transition-all duration-300 text-sm sm:text-base font-semibold text-foreground/90">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {periodFilter === "anual" && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-11 sm:h-12 rounded-2xl border-2 border-primary/20 bg-white/85 shadow-[0_8px_24px_rgba(9,9,121,0.08)] hover:border-primary/40 hover:bg-white transition-all duration-300 text-sm sm:text-base font-semibold text-foreground/90">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears().map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={() => {
                if (!comparisonMode) {
                  setComparisonDialogOpen(true);
                } else {
                  setComparisonMode(false);
                }
              }}
              variant={comparisonMode ? "default" : "outline"}
              className={`gap-2 h-12 px-6 rounded-2xl border-2 ${comparisonMode ? "border-transparent shadow-[0_8px_30px_rgba(220,38,38,0.2)] bg-destructive text-destructive-foreground" : "border-primary/30 bg-white/90 text-foreground/90 shadow-[0_8px_24px_rgba(9,9,121,0.08)] hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(9,9,121,0.18)]"} transition-all duration-300 text-base font-semibold`}
            >
              <GitCompare className="w-4 h-4" />
              Comparativo
            </Button>

            {/* Dialog para seleção de períodos de comparação */}
            <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
              <DialogContent className="max-w-7xl sm:max-w-[95vw] md:max-w-7xl max-h-[95vh] overflow-y-auto p-6">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-center">Comparar Períodos</DialogTitle>
                  <DialogDescription className="text-center mt-2 max-w-2xl mx-auto">
                    Selecione dois períodos diferentes para comparar suas receitas e despesas. 
                    <span className="font-semibold text-foreground"> Clique no primeiro dia e depois no último dia</span> para selecionar o intervalo.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  {/* Período 1 */}
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border-2 transition-all ${comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          1
                        </div>
                        <h3 className="text-xl font-bold">Período 1</h3>
                        {comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to && (
                          <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                            ✓ Selecionado
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2">
                          <Select
                            value={comparisonPeriod1.month || ""}
                            onValueChange={(value) => {
                              setComparisonPeriod1({
                                ...comparisonPeriod1,
                                month: value,
                              });
                            }}
                          >
                            <SelectTrigger className="flex-1 border-2 h-10">
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {getMonthOptions().map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={comparisonPeriod1.year || ""}
                            onValueChange={(value) => {
                              setComparisonPeriod1({
                                ...comparisonPeriod1,
                                year: value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 border-2 h-10">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableYears().map((year) => (
                                <SelectItem key={year.value} value={year.value}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="bg-background rounded-xl p-3 border-2 border-border/50">
                        <Calendar
                          initialFocus
                          mode="range"
                          month={
                            comparisonPeriod1.month && comparisonPeriod1.year
                              ? new Date(parseInt(comparisonPeriod1.year), parseInt(comparisonPeriod1.month) - 1, 1)
                              : comparisonPeriod1.dateRange?.from || new Date()
                          }
                          onMonthChange={(date) => {
                            setComparisonPeriod1({
                              ...comparisonPeriod1,
                              month: String(date.getMonth() + 1).padStart(2, '0'),
                              year: date.getFullYear().toString(),
                            });
                          }}
                          selected={{
                            from: comparisonPeriod1.dateRange?.from,
                            to: comparisonPeriod1.dateRange?.to,
                          }}
                          onSelect={(range) => {
                            setComparisonPeriod1({
                              ...comparisonPeriod1,
                              dateRange: { from: range?.from, to: range?.to },
                            });
                          }}
                          numberOfMonths={1}
                          locale={ptBR}
                          className="w-full"
                        />
                      </div>
                      
                      {comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to ? (
                        <div className="mt-4 p-3 rounded-lg bg-primary/10 border-2 border-primary/30">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Período Selecionado</p>
                          <p className="text-base font-bold text-primary">
                            {format(comparisonPeriod1.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} até {format(comparisonPeriod1.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                          <p className="text-xs text-muted-foreground text-center font-medium">
                            Clique no primeiro dia e depois no último dia do período
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Período 2 */}
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border-2 transition-all ${comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-lg' : 'border-border bg-card'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          2
                        </div>
                        <h3 className="text-xl font-bold">Período 2</h3>
                        {comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to && (
                          <span className="ml-auto text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-semibold">
                            ✓ Selecionado
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2">
                          <Select
                            value={comparisonPeriod2.month || ""}
                            onValueChange={(value) => {
                              setComparisonPeriod2({
                                ...comparisonPeriod2,
                                month: value,
                              });
                            }}
                          >
                            <SelectTrigger className="flex-1 border-2 h-10">
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {getMonthOptions().map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={comparisonPeriod2.year || ""}
                            onValueChange={(value) => {
                              setComparisonPeriod2({
                                ...comparisonPeriod2,
                                year: value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 border-2 h-10">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableYears().map((year) => (
                                <SelectItem key={year.value} value={year.value}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="bg-background rounded-xl p-3 border-2 border-border/50">
                        <Calendar
                          initialFocus
                          mode="range"
                          month={
                            comparisonPeriod2.month && comparisonPeriod2.year
                              ? new Date(parseInt(comparisonPeriod2.year), parseInt(comparisonPeriod2.month) - 1, 1)
                              : comparisonPeriod2.dateRange?.from || new Date()
                          }
                          onMonthChange={(date) => {
                            setComparisonPeriod2({
                              ...comparisonPeriod2,
                              month: String(date.getMonth() + 1).padStart(2, '0'),
                              year: date.getFullYear().toString(),
                            });
                          }}
                          selected={{
                            from: comparisonPeriod2.dateRange?.from,
                            to: comparisonPeriod2.dateRange?.to,
                          }}
                          onSelect={(range) => {
                            setComparisonPeriod2({
                              ...comparisonPeriod2,
                              dateRange: { from: range?.from, to: range?.to },
                            });
                          }}
                          numberOfMonths={1}
                          locale={ptBR}
                          className="w-full"
                        />
                      </div>
                      
                      {comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to ? (
                        <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Período Selecionado</p>
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {format(comparisonPeriod2.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} até {format(comparisonPeriod2.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                          <p className="text-xs text-muted-foreground text-center font-medium">
                            Clique no primeiro dia e depois no último dia do período
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t-2">
                  <div className="text-sm font-medium">
                    {comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to && comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="text-lg">✓</span> Ambos os períodos selecionados
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-2">
                        <span className="text-lg">⚠</span> Selecione ambos os períodos para continuar
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setComparisonDialogOpen(false)}
                      className="min-w-[120px]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        if (comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to) {
                          if (comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to) {
                            setComparisonMode(true);
                            setComparisonDialogOpen(false);
                          } else {
                            toast({
                              title: "Selecione o Período 2",
                              description: "Por favor, selecione o segundo período para comparação.",
                              variant: "destructive",
                            });
                          }
                        } else {
                          toast({
                            title: "Selecione o Período 1",
                            description: "Por favor, selecione o primeiro período para comparação.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!(comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to && comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to)}
                      className="min-w-[180px] font-semibold"
                    >
                      Aplicar Comparação
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {periodFilter === "personalizado" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !customDateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(customDateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(customDateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange.from}
                    selected={{
                      from: customDateRange.from,
                      to: customDateRange.to,
                    }}
                    onSelect={(range) => {
                      setCustomDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex justify-end w-full max-w-7xl mx-auto px-2 sm:px-4">
            <Button 
              onClick={handleExportPDF} 
              className="gap-2 shadow-elegant hover:shadow-elegant-lg transition-all duration-200 group relative z-10"
              size="default"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <QuickActions />

      {comparisonMode ? (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Período 1</h2>
                {comparisonPeriod1.dateRange?.from && comparisonPeriod1.dateRange?.to && (
                  <span className="text-sm text-muted-foreground">
                    {format(comparisonPeriod1.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(comparisonPeriod1.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total de Receitas"
                  value={formatCurrency(comparisonRevenue1 || 0)}
                  icon={TrendingUp}
          variant="success"
                  onClick={() => {
                    setDetailsPeriod("period1");
                    setDetailsType("revenue");
                    setDetailsDialogOpen(true);
                  }}
        />
        <StatsCard
          title="Total de Despesas"
                  value={formatCurrency(comparisonExpense1 || 0)}
          icon={TrendingDown}
          variant="destructive"
                  onClick={() => {
                    setDetailsPeriod("period1");
                    setDetailsType("expense");
                    setDetailsDialogOpen(true);
                  }}
                />
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Saldo</span>
                  <span className={`text-lg font-bold ${(comparisonRevenue1 || 0) - (comparisonExpense1 || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency((comparisonRevenue1 || 0) - (comparisonExpense1 || 0))}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Período 2</h2>
                {comparisonPeriod2.dateRange?.from && comparisonPeriod2.dateRange?.to && (
                  <span className="text-sm text-muted-foreground">
                    {format(comparisonPeriod2.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(comparisonPeriod2.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
                  title="Total de Receitas"
                  value={formatCurrency(comparisonRevenue2 || 0)}
                  icon={TrendingUp}
                  variant="success"
                  onClick={() => {
                    setDetailsPeriod("period2");
                    setDetailsType("revenue");
                    setDetailsDialogOpen(true);
                  }}
        />
        <StatsCard
                  title="Total de Despesas"
                  value={formatCurrency(comparisonExpense2 || 0)}
                  icon={TrendingDown}
                  variant="destructive"
                  onClick={() => {
                    setDetailsPeriod("period2");
                    setDetailsType("expense");
                    setDetailsDialogOpen(true);
                  }}
                />
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Saldo</span>
                  <span className={`text-lg font-bold ${(comparisonRevenue2 || 0) - (comparisonExpense2 || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency((comparisonRevenue2 || 0) - (comparisonExpense2 || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Comparação de Diferença */}
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Comparação de Diferença</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Diferença de Receitas</div>
                  <div className={`text-2xl font-bold ${(comparisonRevenue2 || 0) - (comparisonRevenue1 || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency((comparisonRevenue2 || 0) - (comparisonRevenue1 || 0))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((comparisonRevenue1 || 0) > 0 ? (((comparisonRevenue2 || 0) - (comparisonRevenue1 || 0)) / (comparisonRevenue1 || 1) * 100).toFixed(1) : '0')}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Diferença de Despesas</div>
                  <div className={`text-2xl font-bold ${(comparisonExpense2 || 0) - (comparisonExpense1 || 0) >= 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatCurrency((comparisonExpense2 || 0) - (comparisonExpense1 || 0))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((comparisonExpense1 || 0) > 0 ? (((comparisonExpense2 || 0) - (comparisonExpense1 || 0)) / (comparisonExpense1 || 1) * 100).toFixed(1) : '0')}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Diferença de Saldo</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Período 1: {formatCurrency((comparisonRevenue1 || 0) - (comparisonExpense1 || 0))}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Período 2: {formatCurrency((comparisonRevenue2 || 0) - (comparisonExpense2 || 0))}
                  </div>
                  <div className={`text-2xl font-bold ${((comparisonRevenue2 || 0) - (comparisonExpense2 || 0)) - ((comparisonRevenue1 || 0) - (comparisonExpense1 || 0)) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(((comparisonRevenue2 || 0) - (comparisonExpense2 || 0)) - ((comparisonRevenue1 || 0) - (comparisonExpense1 || 0)))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((comparisonRevenue1 || 0) - (comparisonExpense1 || 0)) !== 0 
                      ? `${((((comparisonRevenue2 || 0) - (comparisonExpense2 || 0)) - ((comparisonRevenue1 || 0) - (comparisonExpense1 || 0))) / Math.abs((comparisonRevenue1 || 0) - (comparisonExpense1 || 0)) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6">
        <StatsCard
            title="Total de Receitas"
            value={formatCurrency(revenueData || 0)}
            icon={TrendingUp}
            variant="success"
            onClick={() => navigate("/receitas")}
        />
        <StatsCard
            title="Total de Despesas"
            value={formatCurrency(expensesData || 0)}
            icon={TrendingDown}
            variant="destructive"
            onClick={() => navigate("/despesas")}
          />
          <StatsCard
            title="Tarefas Pendentes"
            value={pendingCount?.toString() || "0"}
            icon={CheckSquare}
          variant="warning"
            className={hasUrgentTasks ? "animate-pulse-card" : ""}
            onClick={() => setTasksDialogOpen(true)}
            showAlert={hasUrgentTasks}
        />
      </div>
      )}

      {comparisonMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Receitas vs Despesas - Período 1 */}
          <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight">Receitas vs Despesas - Período 1</CardTitle>
          </CardHeader>
            <CardContent className="overflow-visible pb-4 sm:pb-6">
              <div ref={comparisonPieChartRef1} className="w-full overflow-visible">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 320 : window.innerWidth < 768 ? 380 : 420} className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px]">
                <PieChart margin={{ top: window.innerWidth < 640 ? 20 : 30, right: 10, bottom: window.innerWidth < 640 ? 80 : 70, left: 10 }}>
                  <Pie
                data={[
                      { name: "Receitas", value: comparisonRevenue1 || 0 },
                      { name: "Despesas", value: comparisonExpense1 || 0 },
                    ]}
                    cx="50%"
                    cy={window.innerWidth < 640 ? "45%" : "48%"}
                    labelLine={false}
                    label={false}
                    outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 768 ? 85 : 100}
                    innerRadius={window.innerWidth < 640 ? 30 : 40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: window.innerWidth < 640 ? '11px' : '13px'
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name
                    ]}
                    labelStyle={{ 
                      fontWeight: 'bold',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      marginBottom: '4px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={window.innerWidth < 640 ? 70 : 60}
                    iconType="circle"
                    wrapperStyle={{ 
                      paddingTop: window.innerWidth < 640 ? '20px' : '24px',
                      paddingBottom: window.innerWidth < 640 ? '12px' : '8px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: window.innerWidth < 640 ? '16px' : '20px',
                      flexWrap: 'wrap',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'visible'
                    }}
                    formatter={(value, entry: any) => {
                      const data = entry.payload;
                      const formattedValue = formatCurrency(data.value || 0);
                      return (
                        <span style={{ 
                          color: value === 'Receitas' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                          fontWeight: '700',
                          fontSize: window.innerWidth < 640 ? '12px' : '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          lineHeight: '1.6',
                          textAlign: 'center'
                        }}>
                          <span>{value}:</span>
                          <span style={{ fontWeight: '800' }}>{formattedValue}</span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
            </ResponsiveContainer>
              </div>
          </CardContent>
        </Card>

          {/* Receitas vs Despesas - Período 2 */}
          <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight">Receitas vs Despesas - Período 2</CardTitle>
          </CardHeader>
            <CardContent className="overflow-visible">
              <div ref={comparisonPieChartRef2} className="w-full overflow-visible">
                <ResponsiveContainer width="100%" height={350} className="min-h-[350px]">
              <PieChart>
                <Pie
                  data={[
                      { name: "Receitas", value: comparisonRevenue2 || 0 },
                      { name: "Despesas", value: comparisonExpense2 || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                    label={({ name, percent, value }) => {
                      if (value === 0) return '';
                      return `${name}\n${(percent * 100).toFixed(1)}%\n${formatCurrency(value)}`;
                    }}
                    outerRadius={100}
                    innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: window.innerWidth < 640 ? '11px' : '13px'
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name
                    ]}
                    labelStyle={{ 
                      fontWeight: 'bold',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      marginBottom: '4px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={window.innerWidth < 640 ? 70 : 60}
                    iconType="circle"
                    wrapperStyle={{ 
                      paddingTop: window.innerWidth < 640 ? '20px' : '24px',
                      paddingBottom: window.innerWidth < 640 ? '12px' : '8px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: window.innerWidth < 640 ? '16px' : '20px',
                      flexWrap: 'wrap',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'visible'
                    }}
                    formatter={(value, entry: any) => {
                      const data = entry.payload;
                      const formattedValue = formatCurrency(data.value || 0);
                      return (
                        <span style={{ 
                          color: value === 'Receitas' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                          fontWeight: '700',
                          fontSize: window.innerWidth < 640 ? '12px' : '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          lineHeight: '1.6',
                          textAlign: 'center'
                        }}>
                          <span>{value}:</span>
                          <span style={{ fontWeight: '800' }}>{formattedValue}</span>
                        </span>
                      );
                    }}
                  />
              </PieChart>
            </ResponsiveContainer>
              </div>
          </CardContent>
        </Card>
      </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight">Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible pb-4 sm:pb-6">
              <div ref={pieChartRef} className="w-full overflow-x-auto overflow-y-visible break-words sm:overflow-visible">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 320 : window.innerWidth < 768 ? 380 : 420} className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px]">
                <PieChart margin={{ top: window.innerWidth < 640 ? 20 : 30, right: 10, bottom: window.innerWidth < 640 ? 80 : 70, left: 10 }}>
                  <Pie
                    data={[
                      { name: "Receitas", value: revenueData || 0 },
                      { name: "Despesas", value: expensesData || 0 },
                    ]}
                    cx="50%"
                    cy={window.innerWidth < 640 ? "45%" : "48%"}
                    labelLine={false}
                    label={false}
                    outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 768 ? 85 : 100}
                    innerRadius={window.innerWidth < 640 ? 30 : 40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: window.innerWidth < 640 ? '11px' : '13px'
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name
                    ]}
                    labelStyle={{ 
                      fontWeight: 'bold',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      marginBottom: '4px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={window.innerWidth < 640 ? 70 : 60}
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: window.innerWidth < 640 ? '20px' : '24px',
                      paddingBottom: window.innerWidth < 640 ? '12px' : '8px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: window.innerWidth < 640 ? '16px' : '20px',
                      flexWrap: 'wrap',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'visible'
                    }}
                    formatter={(value, entry: any) => {
                      const data = entry.payload;
                      const formattedValue = formatCurrency(data.value || 0);
                      return (
                        <span style={{
                          color: value === 'Receitas' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                          fontWeight: '700',
                          fontSize: window.innerWidth < 640 ? '12px' : '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          lineHeight: '1.6',
                          textAlign: 'center'
                        }}>
                          <span>{value}:</span>
                          <span style={{ fontWeight: '800' }}>{formattedValue}</span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {comparisonMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">Balanço - Período 1</CardTitle>
          </CardHeader>
          <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300">
                      <span className="text-sm font-medium text-muted-foreground">Receitas</span>
                      <span className="text-lg font-bold text-success tracking-tight">
                        {formatCurrency(comparisonRevenue1 || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300">
                      <span className="text-sm font-medium text-muted-foreground">Despesas</span>
                      <span className="text-lg font-bold text-destructive tracking-tight">
                        {formatCurrency(comparisonExpense1 || 0)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 transition-all duration-300">
                        <span className="text-base font-semibold text-foreground">Saldo</span>
                        <span className={`text-2xl font-bold tracking-tight ${(comparisonRevenue1 || 0) - (comparisonExpense1 || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency((comparisonRevenue1 || 0) - (comparisonExpense1 || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">Balanço - Período 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300">
                      <span className="text-sm font-medium text-muted-foreground">Receitas</span>
                      <span className="text-lg font-bold text-success tracking-tight">
                        {formatCurrency(comparisonRevenue2 || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300">
                      <span className="text-sm font-medium text-muted-foreground">Despesas</span>
                      <span className="text-lg font-bold text-destructive tracking-tight">
                        {formatCurrency(comparisonExpense2 || 0)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 transition-all duration-300">
                        <span className="text-base font-semibold text-foreground">Saldo</span>
                        <span className={`text-2xl font-bold tracking-tight ${(comparisonRevenue2 || 0) - (comparisonExpense2 || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency((comparisonRevenue2 || 0) - (comparisonExpense2 || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold tracking-tight">Balanço Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                    onClick={() => navigate("/receitas")}
                  >
                    <div className="absolute inset-0 bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="text-sm font-medium text-muted-foreground relative z-10 group-hover:text-success transition-colors duration-300">Receitas</span>
                    <span className="text-lg font-bold text-success tracking-tight relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {formatCurrency(revenueData || 0)}
                </span>
              </div>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                    onClick={() => navigate("/despesas")}
                  >
                    <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="text-sm font-medium text-muted-foreground relative z-10 group-hover:text-destructive transition-colors duration-300">Despesas</span>
                    <span className="text-lg font-bold text-destructive tracking-tight relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {formatCurrency(expensesData || 0)}
                </span>
              </div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-lg">
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-base font-semibold text-foreground relative z-10 group-hover:scale-105 transition-transform duration-300">Saldo</span>
                      <span className={`text-2xl font-bold tracking-tight relative z-10 group-hover:scale-110 transition-transform duration-300 ${(revenueData || 0) - (expensesData || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency((revenueData || 0) - (expensesData || 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          )}
        </div>
      )}

      {/* Receitas por Categoria e Despesas por Categoria */}
      {comparisonMode ? (
        <>
          {/* Período 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-sm sm:text-base md:text-lg">Receitas por Categoria - Período 1</span>
                </CardTitle>
          </CardHeader>
              <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
                <div ref={comparisonRevenueCategoryChartRef1} className="w-full overflow-visible">
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 320 : window.innerWidth < 768 ? 360 : getChartHeight()} className={getChartMinHeight()}>
                    <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 90 : 100, left: 10 }}>
                    <Pie
                      data={comparisonRevenueByCategory1 || []}
                      cx="50%"
                      cy={window.innerWidth < 640 ? "45%" : "50%"}
                      labelLine={false}
                      label={false}
                      outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 768 ? 85 : 100}
                      innerRadius={window.innerWidth < 640 ? 20 : 30}
                      fill="#8884d8"
                      dataKey="amount"
                      paddingAngle={2}
                    >
                      {(comparisonRevenueByCategory1 || []).map((entry: any, index: number) => (
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
                        paddingTop: window.innerWidth < 640 ? '12px' : '16px',
                        paddingBottom: window.innerWidth < 640 ? '8px' : '0px',
                        fontSize: window.innerWidth < 640 ? '10px' : '12px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: window.innerWidth < 640 ? '8px' : '12px',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'visible'
                      }}
                      formatter={(value, entry: any) => {
                        const data = entry.payload;
                        const total = comparisonRevenueByCategory1 ? comparisonRevenueByCategory1.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  <span className="text-sm sm:text-base md:text-lg">Despesas por Categoria - Período 1</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
                <div ref={comparisonExpenseCategoryChartRef1} className="w-full overflow-visible">
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : window.innerWidth < 768 ? 400 : getChartHeight()} className={getChartMinHeight()}>
                    <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
                    <Pie
                      data={comparisonExpensesByCategory1 || []}
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
                      {(comparisonExpensesByCategory1 || []).map((entry: any, index: number) => (
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
                        const total = comparisonExpensesByCategory1 ? comparisonExpensesByCategory1.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
              </CardContent>
            </Card>
              </div>

          {/* Período 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-sm sm:text-base md:text-lg">Receitas por Categoria - Período 2</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
                <div ref={comparisonRevenueCategoryChartRef2} className="w-full overflow-visible">
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : window.innerWidth < 768 ? 400 : getChartHeight()} className={getChartMinHeight()}>
                    <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
                    <Pie
                      data={comparisonRevenueByCategory2 || []}
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
                      {(comparisonRevenueByCategory2 || []).map((entry: any, index: number) => (
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
                        const total = comparisonRevenueByCategory2 ? comparisonRevenueByCategory2.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
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
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

            <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  <span className="text-sm sm:text-base md:text-lg">Despesas por Categoria - Período 2</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
                <div ref={comparisonExpenseCategoryChartRef2} className="w-full overflow-visible">
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : window.innerWidth < 768 ? 400 : getChartHeight()} className={getChartMinHeight()}>
                    <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
                    <Pie
                      data={comparisonExpensesByCategory2 || []}
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
                      {(comparisonExpensesByCategory2 || []).map((entry: any, index: number) => (
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
                        const total = comparisonExpensesByCategory2 ? comparisonExpensesByCategory2.reduce((sum: number, item: any) => sum + item.amount, 0) : 0;
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
                  </PieChart>
                </ResponsiveContainer>
      </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Receitas por Categoria */}
          <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base md:text-lg">Receitas por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
              <div ref={revenueCategoryChartRef} className="w-full overflow-visible">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : window.innerWidth < 768 ? 400 : getChartHeight()} className={getChartMinHeight()}>
                  <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
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
                </PieChart>
              </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* Despesas por Categoria */}
          <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-visible">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                <span className="text-sm sm:text-base md:text-lg">Despesas por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible px-3 sm:px-6 pb-4 sm:pb-6">
              <div ref={expenseCategoryChartRef} className="w-full overflow-visible">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 350 : window.innerWidth < 768 ? 400 : getChartHeight()} className={getChartMinHeight()}>
                  <PieChart margin={{ top: 10, right: 10, bottom: window.innerWidth < 640 ? 100 : 120, left: 10 }}>
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
                </PieChart>
              </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise Mensal Detalhada */}
      <Card className="border-0 shadow-elegant dashboard-card transition-all duration-300 hover:shadow-xl hover:scale-[1.01] mb-6 overflow-visible">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Análise Mensal Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div ref={monthlyAnalysisChartRef} className="w-full overflow-visible">
            <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
              <BarChart data={monthlyAnalysisData || []} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  padding: '10px 12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                formatter={(value: any) => formatCurrency(value)}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '15px' }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
              />
              <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" radius={[6, 6, 0, 0]} barSize={30} />
              <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      {/* Dialog de Tarefas Pendentes */}
      <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tarefas Pendentes ({pendingTasks?.length || 0})</DialogTitle>
            <DialogDescription>
              Visualize e gerencie todas as tarefas pendentes do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {pendingTasks && pendingTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasks.map((task: any) => {
                    const status = task.status || (task.completed ? "concluida" : "pendente");
                    const priority = task.priority || "media";
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    const isOverdue = dueDate < today && status !== "concluida";
                    
                    const statusColors: Record<string, string> = {
                      pendente: "bg-warning/20 text-warning border-warning/30 border-2 font-semibold",
                      em_andamento: "bg-primary/20 text-primary border-primary/30 border-2 font-semibold",
                      concluida: "bg-success/20 text-success border-success/30 border-2 font-semibold",
                    };
                    
                    const priorityColors: Record<string, string> = {
                      baixa: "bg-muted text-muted-foreground",
                      media: "bg-warning/10 text-warning",
                      alta: "bg-destructive/10 text-destructive",
                    };
                    
                    const statusLabels: Record<string, string> = {
                      pendente: "Pendente",
                      em_andamento: "Em Andamento",
                      concluida: "Concluída",
                    };
                    
                    const priorityLabels: Record<string, string> = {
                      baixa: "Baixa",
                      media: "Média",
                      alta: "Alta",
                    };
                    
                    return (
                      <TableRow 
                        key={task.id}
                        className={isOverdue ? "bg-destructive/5" : ""}
                        onClick={() => {
                          setTasksDialogOpen(false);
                          navigate("/tarefas");
                        }}
                      >
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{task.description || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[priority]}>
                            {priorityLabels[priority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={isOverdue ? "text-destructive font-semibold" : ""}>
                            {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[status]}>
                            {statusLabels[status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa pendente</p>
      </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setTasksDialogOpen(false);
                navigate("/tarefas");
              }}
              className="text-sm text-primary hover:underline"
            >
              Ver todas as tarefas →
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes para Comparação */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Detalhes {detailsType === "revenue" ? "de Receitas" : "de Despesas"} - {detailsPeriod === "period1" ? "Período 1" : "Período 2"}
            </DialogTitle>
            {detailsPeriod && (detailsPeriod === "period1" ? comparisonPeriod1.dateRange : comparisonPeriod2.dateRange)?.from && 
             (detailsPeriod === "period1" ? comparisonPeriod1.dateRange : comparisonPeriod2.dateRange)?.to && (
              <DialogDescription className="mt-2">
                Período: {format(
                  (detailsPeriod === "period1" ? comparisonPeriod1.dateRange : comparisonPeriod2.dateRange)!.from!,
                  "dd/MM/yyyy",
                  { locale: ptBR }
                )} até {format(
                  (detailsPeriod === "period1" ? comparisonPeriod1.dateRange : comparisonPeriod2.dateRange)!.to!,
                  "dd/MM/yyyy",
                  { locale: ptBR }
                )}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4">
            {detailsType === "revenue" ? (
              <div>
                {detailsPeriod === "period1" ? (
                  comparisonRevenueDetails1 && comparisonRevenueDetails1.length > 0 ? (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
                            <TableHead className="font-bold">Descrição</TableHead>
                            <TableHead className="font-bold">Data</TableHead>
                            <TableHead className="font-bold">Categoria</TableHead>
                            <TableHead className="font-bold">Classificação</TableHead>
                            <TableHead className="font-bold text-center">Valor</TableHead>
                            <TableHead className="font-bold">Periodicidade</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonRevenueDetails1.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell>{item.classification || "-"}</TableCell>
                              <TableCell className="text-center font-semibold text-success">
                                {formatCurrency(Number(item.amount || 0))}
                              </TableCell>
                              <TableCell>{item.frequency || "Única"}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === "received" ? "default" : "secondary"}>
                                  {item.status === "received" ? "Recebido" : "Pendente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma receita encontrada para este período</p>
                    </div>
                  )
                ) : (
                  comparisonRevenueDetails2 && comparisonRevenueDetails2.length > 0 ? (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
                            <TableHead className="font-bold">Descrição</TableHead>
                            <TableHead className="font-bold">Data</TableHead>
                            <TableHead className="font-bold">Categoria</TableHead>
                            <TableHead className="font-bold">Classificação</TableHead>
                            <TableHead className="font-bold text-center">Valor</TableHead>
                            <TableHead className="font-bold">Periodicidade</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonRevenueDetails2.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell>{item.classification || "-"}</TableCell>
                              <TableCell className="text-center font-semibold text-success">
                                {formatCurrency(Number(item.amount || 0))}
                              </TableCell>
                              <TableCell>{item.frequency || "Única"}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === "received" ? "default" : "secondary"}>
                                  {item.status === "received" ? "Recebido" : "Pendente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma receita encontrada para este período</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div>
                {detailsPeriod === "period1" ? (
                  comparisonExpenseDetails1 && comparisonExpenseDetails1.length > 0 ? (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-destructive/10 to-destructive/5">
                            <TableHead className="font-bold">Descrição</TableHead>
                            <TableHead className="font-bold">Data</TableHead>
                            <TableHead className="font-bold">Categoria</TableHead>
                            <TableHead className="font-bold text-center">Valor</TableHead>
                            <TableHead className="font-bold">Periodicidade</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonExpenseDetails1.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell className="text-center font-semibold text-destructive">
                                {formatCurrency(Number(item.amount || 0))}
                              </TableCell>
                              <TableCell>{item.frequency || "Única"}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === "paid" ? "default" : "secondary"}>
                                  {item.status === "paid" ? "Pago" : "Pendente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma despesa encontrada para este período</p>
                    </div>
                  )
                ) : (
                  comparisonExpenseDetails2 && comparisonExpenseDetails2.length > 0 ? (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-destructive/10 to-destructive/5">
                            <TableHead className="font-bold">Descrição</TableHead>
                            <TableHead className="font-bold">Data</TableHead>
                            <TableHead className="font-bold">Categoria</TableHead>
                            <TableHead className="font-bold text-center">Valor</TableHead>
                            <TableHead className="font-bold">Periodicidade</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparisonExpenseDetails2.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell className="text-center font-semibold text-destructive">
                                {formatCurrency(Number(item.amount || 0))}
                              </TableCell>
                              <TableCell>{item.frequency || "Única"}</TableCell>
                              <TableCell>
                                <Badge variant={item.status === "paid" ? "default" : "secondary"}>
                                  {item.status === "paid" ? "Pago" : "Pendente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma despesa encontrada para este período</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
