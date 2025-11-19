import { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, ChevronLeft, X, RotateCcw } from "lucide-react";

export default function Faturamento() {
  const [currentPage, setCurrentPage] = useState(0); // Página atual (0 = primeiros 10 meses)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const MONTHS_PER_PAGE = isMobile ? 3 : 10; // Mobile: 3 meses, Desktop: 10
  const tableScrollRef = useRef<HTMLDivElement>(null);
  // Buscar todas as receitas cadastradas
  const { data: consolidatedRevenues } = useQuery({
    queryKey: ["consolidated-revenues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("id, date, description, category, classification, amount, status, frequency, installments, documentation_status, client_id, property_id, created_at, updated_at")
        .order("date", { ascending: true });
      if (error) throw error;
      
      return data || [];
    },
  });

  // Gerar todos os meses disponíveis, cobrindo do menor ao maior mês das receitas
  const allMonths = useMemo(() => {
    let minDate = new Date();
    let maxDate = new Date();
    if (consolidatedRevenues && consolidatedRevenues.length > 0) {
      consolidatedRevenues.forEach((revenue: any) => {
        let d = typeof revenue.date === 'string' ? new Date(revenue.date) : revenue.date;
        if (d instanceof Date && !isNaN(d.getTime())) {
          if (d < minDate) minDate = new Date(d.getFullYear(), d.getMonth(), 1);
          if (d > maxDate) maxDate = new Date(d.getFullYear(), d.getMonth(), 1);
          // Considerar parcelas futuras
          if (revenue.frequency && revenue.frequency.toString().toUpperCase() !== 'ÚNICA') {
            const installmentsCount = revenue.installments ? parseInt(revenue.installments.toString()) : null;
            if (installmentsCount && installmentsCount > 1) {
              if (revenue.frequency.toString().toUpperCase().includes('MENSAL')) {
                const futureMonth = new Date(d.getFullYear(), d.getMonth() + installmentsCount - 1, 1);
                if (futureMonth > maxDate) maxDate = futureMonth;
              } else if (revenue.frequency.toString().toUpperCase().includes('ANUAL')) {
                const futureYear = new Date(d.getFullYear() + installmentsCount - 1, d.getMonth(), 1);
                if (futureYear > maxDate) maxDate = futureYear;
              }
            }
          }
        }
      });
    }
    // Garantir que o mês atual está incluído
    const today = new Date();
    if (today > maxDate) maxDate = new Date(today.getFullYear(), today.getMonth(), 1);
    // Gerar lista de meses entre minDate e maxDate
    const monthsList = [];
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (current <= maxDate) {
      monthsList.push({
        key: format(current, "yyyy-MM"),
        label: format(current, "MMM/yyyy", { locale: ptBR }).toUpperCase(),
        fullDate: new Date(current),
      });
      current.setMonth(current.getMonth() + 1);
    }
    return monthsList;
  }, [consolidatedRevenues]);

  // Calcular meses da página atual (Mobile: 3 meses + total, Desktop: 10 meses)
  const months = useMemo(() => {
    if (isMobile) {
      const startIndex = currentPage * 3;
      const endIndex = startIndex + 3;
      let selectedMonths = allMonths.slice(startIndex, endIndex);
      selectedMonths = [...selectedMonths, { key: 'TOTAL', label: 'TOTAL', fullDate: null }];
      return selectedMonths;
    } else {
      const startIndex = currentPage * 10;
      const endIndex = startIndex + 10;
      return allMonths.slice(startIndex, endIndex);
    }
  }, [allMonths, currentPage, isMobile]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return isMobile ? Math.ceil(allMonths.length / 3) : Math.ceil(allMonths.length / 10);
  }, [allMonths.length, isMobile]);

  // Verificar se há próxima página
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Função para navegar para próxima página
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
      // Scroll para o início da tabela
      if (tableScrollRef.current) {
        tableScrollRef.current.scrollLeft = 0;
      }
    }
  };

  // Função para navegar para página anterior
  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      // Scroll para o início da tabela
      if (tableScrollRef.current) {
        tableScrollRef.current.scrollLeft = 0;
      }
    }
  };

  // Função para resetar a página
  const handleResetMonths = () => {
    setCurrentPage(0);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = 0;
    }
  };

  // Função para gerar parcelas futuras baseadas na periodicidade
  const generateInstallments = (revenue: any, months: any[]) => {
    // Usar Map para evitar duplicatas de monthKey
    const installmentsMap = new Map<string, number>();
    const frequency = (revenue.frequency || "Única").toString();
    const installmentsCount = revenue.installments ? parseInt(revenue.installments.toString()) : null;
    
    // Parse da data - garantir que está no formato correto
    let startDate: Date;
    if (typeof revenue.date === 'string') {
      startDate = new Date(revenue.date);
    } else if (revenue.date instanceof Date) {
      startDate = new Date(revenue.date);
    } else {
      return [];
    }
    
    // Validar data
    if (isNaN(startDate.getTime())) {
      return [];
    }
    
    const amount = Number(revenue.amount || 0);
    if (amount <= 0) {
      return [];
    }

    // Normalizar frequency para comparação
    const frequencyUpper = frequency.toUpperCase();
    const isMensal = frequencyUpper.includes("MENSAL");
    const isAnual = frequencyUpper.includes("ANUAL");
    const isTempoDeterminado = frequencyUpper.includes("TEMPO DETERMINADO") || frequencyUpper.includes("TEMPO_DETERMINADO");
    const isFixo = frequencyUpper.includes("FIXO") && !isTempoDeterminado;

    // Criar um mapa dos meses disponíveis para busca rápida
    const monthsMap = new Map(months.map(m => [m.key, m]));
    
    // Obter o primeiro e último mês disponível para limites
    const firstMonth = months[0]?.fullDate;
    const lastMonth = months[months.length - 1]?.fullDate;
    if (!firstMonth || !lastMonth) return [];

    // Receita única - apenas no mês da data
    if (frequency === "Única" || (!isMensal && !isAnual)) {
      const monthKey = format(startDate, "yyyy-MM");
      if (monthsMap.has(monthKey)) {
        installmentsMap.set(monthKey, amount);
      }
      return Array.from(installmentsMap.entries()).map(([monthKey, amount]) => ({
        monthKey,
        amount,
      }));
    }

    // Receita mensal
    if (isMensal) {
      if (isFixo) {
        // Mensal Fixo - gerar para TODOS os meses a partir do mês da data de início
        // Começar do mês da data de início (inclusive)
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        
        // Gerar todos os meses a partir do mês de início até o último mês disponível
        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          const monthKey = format(currentMonth, "yyyy-MM");
          if (monthsMap.has(monthKey)) {
            installmentsMap.set(monthKey, amount);
          }
          // Avançar para o próximo mês
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      } else if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
        // Mensal por Tempo Determinado - gerar exatamente o número de parcelas especificado
        // Começar do mês da data de início - sempre usar dia 1 para evitar problemas com datas inválidas
        for (let i = 0; i < installmentsCount; i++) {
          const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const monthKey = format(installmentDate, "yyyy-MM");
          
          // Verificar se o mês está dentro dos meses exibidos
          if (monthsMap.has(monthKey)) {
            installmentsMap.set(monthKey, amount);
          }
        }
      } else {
        // Fallback para "Mensal" simples ou sem tipo definido - tratar como fixo
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        
        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
          const monthKey = format(currentMonth, "yyyy-MM");
          if (monthsMap.has(monthKey)) {
            installmentsMap.set(monthKey, amount);
          }
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      }
    }
    // Receita anual
    else if (isAnual) {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth(); // 0-11 (Janeiro = 0)
      
      // Priorizar Tempo Determinado sobre Fixo
      if (isTempoDeterminado && installmentsCount && installmentsCount > 0) {
        // Anual por Tempo Determinado - gerar exatamente X parcelas (uma por ano)
        // Sempre usar o primeiro dia do mês para evitar problemas com datas inválidas
        for (let i = 0; i < installmentsCount; i++) {
          const installmentYear = startYear + i;
          // Criar monthKey diretamente usando ano e mês
          const monthKey = `${installmentYear}-${String(startMonth + 1).padStart(2, '0')}`;
          
          // Verificar se o mês está dentro dos meses exibidos
          if (monthsMap.has(monthKey)) {
            installmentsMap.set(monthKey, amount);
          }
        }
      } else {
        // Anual Fixo ou Anual simples - gerar para TODOS os anos no mesmo mês
        // Começar do ano da data de início (inclusive)
        const endYear = lastMonth.getFullYear();
        
        // Gerar para todos os anos do ano de início até o último ano disponível
        // Sempre usar o primeiro dia do mês para evitar problemas com datas inválidas
        for (let year = startYear; year <= endYear; year++) {
          // Criar monthKey diretamente usando ano e mês
          const monthKey = `${year}-${String(startMonth + 1).padStart(2, '0')}`;
          
          // Verificar se o mês está dentro dos meses exibidos
          if (monthsMap.has(monthKey)) {
            installmentsMap.set(monthKey, amount);
          }
        }
      }
    }

    // Converter Map para Array
    return Array.from(installmentsMap.entries()).map(([monthKey, amount]) => ({
      monthKey,
      amount,
    }));
  };

  // Processar receitas consolidadas agrupadas por categoria e mês
  const billingData = useMemo(() => {
    if (!consolidatedRevenues) return [];

    // Agrupar receitas por categoria
    const byCategory: Record<string, Record<string, number>> = {};

    consolidatedRevenues.forEach((revenue: any) => {
      const category = revenue.category || "Sem Categoria";
      
      // Gerar todas as parcelas para esta receita
      const installments = generateInstallments(revenue, months);
      
      installments.forEach(({ monthKey, amount }) => {
        if (!byCategory[category]) {
          byCategory[category] = {};
        }

        if (!byCategory[category][monthKey]) {
          byCategory[category][monthKey] = 0;
        }

        byCategory[category][monthKey] += amount;
      });
    });

    // Converter para array de dados
    return Object.entries(byCategory).map(([category, monthlyData]) => {
      const total = Object.values(monthlyData).reduce((sum, val) => sum + val, 0);
      return {
        category,
        monthlyData,
        total,
      };
    });
  }, [consolidatedRevenues, allMonths, months]);

  // Calcular totais por mês (apenas para os meses da página atual)
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    months.forEach((month) => {
      totals[month.key] = billingData.reduce((sum, item) => {
        return sum + (item.monthlyData[month.key] || 0);
      }, 0);
    });
    return totals;
  }, [billingData, months]);

  // Calcular total geral (soma de todos os meses disponíveis)
  const grandTotal = useMemo(() => {
    return billingData.reduce((sum, item) => sum + item.total, 0);
  }, [billingData]);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCategoryLabel = (label: string) => {
    if (!label) return "";
    const normalized = label.replace(/\s+/g, " ").trim();
    return normalized.replace(/\b(de|da|do|das|dos)\b\s+/gi, (match) => `${match.trim()}\u00A0`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full px-0.25 sm:px-0.5 md:px-0.75">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Faturamento"
          description="Soma de todas as receitas cadastradas por categoria e mês"
        />
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-semibold text-sm shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
            <span>
              Página {currentPage + 1} de {totalPages}
            </span>
          </div>
          {hasPreviousPage && (
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              className="gap-2 rounded-2xl border-2 border-primary/30 bg-white/85 text-primary font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:border-primary hover:bg-primary/5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all duration-200"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
          )}
          {hasNextPage && (
            <Button
              variant="outline"
              onClick={handleNextPage}
              className="gap-2 rounded-2xl border-2 border-primary/30 bg-white/85 text-primary font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:border-primary hover:bg-primary/5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all duration-200"
              size="sm"
            >
              <span className="hidden sm:inline">Próximo</span>
              <span className="sm:hidden">Avançar</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {currentPage > 0 && (
            <Button
              variant="outline"
              onClick={handleResetMonths}
              className="gap-2 rounded-2xl border-2 border-primary/30 bg-white/85 text-primary font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:border-primary hover:bg-primary/5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all duration-200"
              size="sm"
              title="Voltar para início"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
            </Button>
          )}
        </div>
      </div>

      <QuickActions />

      {/* Mobile: Cards verticais | Desktop: Tabela */}
      {isMobile ? (
        <div className="space-y-4">
          {billingData.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="font-medium text-muted-foreground">Nenhuma receita cadastrada encontrada</span>
              </div>
            </Card>
          ) : (
            billingData.map((item, index) => (
              <Card key={item.category} className="border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-3 text-foreground border-b border-border/30 pb-2">
                    {formatCategoryLabel(item.category)}
                  </h3>
                  <div className="space-y-2">
                    {months.filter(m => m.key !== 'TOTAL' && item.monthlyData[m.key]).map((month) => (
                      <div key={month.key} className="flex justify-between items-center py-1.5 border-b border-border/10 last:border-0">
                        <span className="text-xs text-muted-foreground">{month.label}</span>
                        <span className="text-sm font-semibold text-success">
                          {formatCurrency(item.monthlyData[month.key])}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-primary/30">
                      <span className="text-sm font-bold text-foreground">Total</span>
                      <span className="text-base font-bold text-success">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {billingData.length > 0 && (
            <Card className="border-2 border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">TOTAL GERAL</span>
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-elegant-lg border-2 border-border/50 overflow-hidden w-full relative mx-auto max-w-full">
          <div 
            ref={tableScrollRef} 
            className="overflow-x-auto w-full faturamento-scroll"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--primary) / 0.4) transparent'
            }}
          >
            <style>{`
              .faturamento-scroll {
                scrollbar-gutter: stable;
              }
              .faturamento-scroll::-webkit-scrollbar {
                height: 12px;
                display: block;
              }
              .faturamento-scroll::-webkit-scrollbar-track {
                background: hsl(var(--muted) / 0.3);
                border-radius: 6px;
                margin: 0 4px;
              }
              .faturamento-scroll::-webkit-scrollbar-thumb {
                background: hsl(var(--primary) / 0.4);
                border-radius: 6px;
              }
              .faturamento-scroll::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--primary) / 0.6);
              }
            `}</style>
            <Table className="w-full min-w-max text-xs sm:text-sm border-separate border-spacing-0 min-w-[1200px]">
            <TableHeader>
              <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
                <TableHead className="sticky left-0 z-10 bg-gradient-to-r from-muted/40 to-muted/30 backdrop-blur-sm min-w-[60px] sm:min-w-[75px] md:min-w-[100px] max-w-[60px] sm:max-w-[75px] md:max-w-[100px] text-center text-xs sm:text-sm px-2 sm:px-4 font-bold border-r border-border/50 rounded-tl-xl">
                  Descrição
                </TableHead>
                {months.map((month, index) => (
                  <TableHead 
                    key={month.key} 
                    className="text-center min-w-[90px] sm:min-w-[100px] md:min-w-[120px] text-xs sm:text-sm px-1 sm:px-2 font-semibold bg-gradient-to-b from-primary/10 to-transparent border-r border-border/30"
                  >
                      <span className="whitespace-nowrap">{month.label}</span>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold bg-gradient-to-r from-primary/10 to-primary/5 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] sticky right-0 z-10 text-xs sm:text-sm px-2 sm:px-4 border-l-2 border-primary/30 rounded-tr-xl">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={months.length + 2} className="text-center py-12 text-muted-foreground/70 text-xs sm:text-sm border-0">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <span className="font-medium">Nenhuma receita cadastrada encontrada</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {billingData.map((item, index) => (
                    <TableRow key={item.category} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}>
                      <TableCell className="font-semibold sticky left-0 z-10 bg-inherit text-xs sm:text-sm px-2 sm:px-4 border-r border-border/30 max-w-[60px] sm:max-w-[75px] md:max-w-[100px]">
                        <span className="block break-words whitespace-pre-wrap hyphens-auto leading-tight text-center text-foreground/90">
                          {formatCategoryLabel(item.category)}
                        </span>
                      </TableCell>
                      {months.map((month) => (
                        <TableCell 
                          key={month.key} 
                          className="text-center font-medium text-xs sm:text-sm px-1 sm:px-2 border-r border-border/20"
                        >
                          {item.monthlyData[month.key] ? (
                            <span className="text-success font-semibold whitespace-nowrap">
                              {formatCurrency(item.monthlyData[month.key])}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-success bg-primary/5 border-l-2 border-primary/30 sticky right-0 z-10 text-xs sm:text-sm px-2 sm:px-4" style={{ right: 0 }}>
                        <span className="whitespace-nowrap">{formatCurrency(item.total)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 font-bold border-t-2 border-primary/50 border-b-2 border-primary/30">
                    <TableCell className="sticky left-0 z-10 bg-inherit font-bold border-r-2 border-primary/40 text-xs sm:text-sm px-2 sm:px-4 rounded-bl-xl text-center">
                      <span className="text-foreground">TOTAL</span>
                    </TableCell>
                    {months.map((month) => (
                      <TableCell 
                        key={month.key} 
                        className="text-center font-bold text-success text-xs sm:text-sm px-1 sm:px-2 border-r border-primary/20"
                      >
                        <span className="whitespace-nowrap">{formatCurrency(monthlyTotals[month.key] || 0)}</span>
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold text-success bg-primary/20 border-l-2 border-primary/50 sticky right-0 z-10 text-xs sm:text-sm px-2 sm:px-4 rounded-br-xl" style={{ right: 0 }}>
                      <span className="whitespace-nowrap">{formatCurrency(grandTotal)}</span>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
            </Table>
          </div>
        </div>
      )}

    </div>
  );
}
