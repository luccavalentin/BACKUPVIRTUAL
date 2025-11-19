import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { StatsCard } from "@/components/layout/StatsCard";
import { ScrollAwareContainer } from "@/components/layout/ScrollAwareContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { Pencil, Trash2, Download, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle2, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";
import * as XLSX from "xlsx";

type LoanScheduleConfig = {
  installments: number;
  totalAmount: number;
  firstDate: string;
  type: string;
  linkedClientId?: string | null;
};

type CreateLoanInput = {
  loanData: any;
  scheduleConfig: LoanScheduleConfig;
};

export default function Emprestimos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    type: "Empréstimo",
    status: "Ativo",
    due_date: "",
    installments: "1",
    first_installment_date: "",
  });

  const { data: loans } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*, clients(name)");
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredLoans, resultCount, totalCount } = useSmartSearch(
    loans,
    ["description", "type", "link_type", "status"]
  );

  // Aplicar filtros adicionais
  const filteredByFilters = useMemo(() => {
    if (!filteredLoans) return [];
    let filtered = filteredLoans;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((loan: any) => loan.status === statusFilter);
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter((loan: any) => loan.type === typeFilter);
    }
    
    return filtered;
  }, [filteredLoans, statusFilter, typeFilter]);

  const { sortedData: sortedLoans, SortButton } = useTableSort(filteredByFilters);

  // Estatísticas
  const stats = useMemo(() => {
    if (!loans) return { total: "0", ativos: "0", pendentes: "0", totalValue: 0, emprestimosDados: "0", emprestimosRecebidos: "0" };
    
    const total = loans.length;
    const ativos = loans.filter((l: any) => l.status === "Ativo" || l.status === "active").length;
    const pendentes = loans.filter((l: any) => l.status === "Pendente" || l.status === "pending").length;
    const totalValue = loans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
    const emprestimosDados = loans.filter((l: any) => l.type === "loan_given" || l.type === "Empréstimo Dado").length;
    const emprestimosRecebidos = loans.filter((l: any) => l.type === "loan_received" || l.type === "Empréstimo Recebido").length;
    
    return { 
      total: total.toString(), 
      ativos: ativos.toString(), 
      pendentes: pendentes.toString(), 
      totalValue,
      emprestimosDados: emprestimosDados.toString(),
      emprestimosRecebidos: emprestimosRecebidos.toString()
    };
  }, [loans]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const generateLoanFinancialEntries = async (loan: any, schedule: LoanScheduleConfig) => {
    if (!schedule.totalAmount || schedule.totalAmount <= 0) return;

    const installments = Math.max(1, schedule.installments);
    const amountPerInstallment = schedule.totalAmount / installments;
    const normalizedType = (schedule.type || "").toLowerCase();
    const isReceivable = normalizedType.includes("receb");
    const table = isReceivable ? "revenue" : "expenses";
    const baseFrequency = installments > 1 ? "Mensal Tempo Determinado" : "Única";
    const firstDate = schedule.firstDate || format(new Date(), "yyyy-MM-dd");

    const entries = Array.from({ length: installments }, (_, index) => {
      const installmentDate = addMonths(new Date(firstDate), index);
      const descriptionBase = loan.description || (isReceivable ? "Recebível" : "Empréstimo");
      const common = {
        description: standardizeText(
          `${descriptionBase}${installments > 1 ? ` - Parcela ${index + 1}/${installments}` : ""}`
        ),
        amount: Number(amountPerInstallment.toFixed(2)),
        date: format(installmentDate, "yyyy-MM-dd"),
        frequency: baseFrequency,
        installments: installments > 1 ? installments : null,
      };

      if (isReceivable) {
        return {
          ...common,
          category: "Recebíveis",
          classification: "Recebíveis",
          client_id: schedule.linkedClientId || null,
        };
      }

      return {
        ...common,
        category: "Empréstimos",
        status: "PENDENTE",
      };
    });

    const { error } = await supabase.from(table).insert(entries);
    if (error) throw error;

    await queryClient.invalidateQueries({ queryKey: [table === "revenue" ? "revenues" : "expenses"] });
    toast({
      title: isReceivable ? "Recebíveis gerados" : "Despesas geradas",
      description: `${entries.length} lançamento${entries.length > 1 ? "s" : ""} criado${
        entries.length > 1 ? "s" : ""
      } automaticamente.`,
    });
  };

  const handleSubmitLogic = async () => {
    const amountNumber = formData.amount ? parseFloat(String(formData.amount).replace(",", ".")) : 0;
    const installmentsCount = Math.max(1, parseInt(formData.installments || "1", 10));
    const firstInstallmentDate =
      formData.first_installment_date || formData.due_date || format(new Date(), "yyyy-MM-dd");

    const data = {
      description: formData.title 
        ? standardizeText(`${formData.title}${formData.description ? ` - ${formData.description}` : ""}`)
        : (formData.description ? standardizeText(formData.description) : ""),
      amount: amountNumber,
      type: formData.type,
      due_date: formData.due_date || null,
      status: formData.status || "Ativo",
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      const scheduleConfig: LoanScheduleConfig = {
        installments: installmentsCount,
        totalAmount: amountNumber,
        firstDate: firstInstallmentDate,
        type: formData.type,
        linkedClientId: null,
      };
      await createMutation.mutateAsync({ loanData: data, scheduleConfig });
    }
  };

  const createMutation = useMutation({
    mutationFn: async ({ loanData }: CreateLoanInput) => {
      const { data, error } = await supabase
        .from("loans")
        .insert([loanData])
        .select("*, clients(name)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (loan, { scheduleConfig }) => {
      await queryClient.invalidateQueries({ queryKey: ["loans"] });
      // toast({ title: "Registro cadastrado com sucesso!" });

      if (scheduleConfig && scheduleConfig.totalAmount > 0) {
        try {
          await generateLoanFinancialEntries(loan, scheduleConfig);
        } catch (error: any) {
          toast({
            title: "Falha ao gerar lançamentos automáticos",
            description: error?.message || "Tente novamente ou cadastre manualmente.",
            variant: "destructive",
          });
        }
      }

      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar empréstimo",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("loans").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Empréstimo atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar empréstimo",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Empréstimo excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setLoanToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir empréstimo",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setLoanToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setLoanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (loanToDelete) {
      deleteMutation.mutate(loanToDelete);
    }
  };

  const handleExportPDF = () => {
    if (!loans || loans.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há empréstimos cadastrados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Empréstimos", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = loans.map((loan: any) => [
        loan.description || "",
        loan.type === "loan_given" ? "Empréstimo Dado" : loan.type === "loan_received" ? "Empréstimo Recebido" : loan.type || "",
        loan.amount ? formatCurrency(loan.amount) : "",
        loan.status || "",
        loan.due_date ? format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ptBR }) : "",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Descrição", "Tipo", "Valor", "Status", "Data Vencimento"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Emprestimos_${format(new Date(), "dd-MM-yyyy")}.pdf`;
      doc.save(fileName);

      toast({
        title: "Sucesso",
        description: "Arquivo PDF exportado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    if (!loans || loans.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há empréstimos cadastrados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = loans.map((loan: any) => ({
      Descrição: loan.description || "",
      Tipo: loan.type === "loan_given" ? "Empréstimo Dado" : loan.type === "loan_received" ? "Empréstimo Recebido" : loan.type || "",
      Valor: loan.amount ? formatCurrency(loan.amount) : "",
      Status: loan.status || "",
      "Data de Vencimento": loan.due_date ? format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ptBR }) : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empréstimos");
    XLSX.writeFile(wb, `emprestimos_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${loans.length} empréstimo(s) exportado(s) com sucesso.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(String(formData.amount)) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor maior que zero para registrar o empréstimo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.installments || parseInt(formData.installments, 10) < 1) {
      toast({
        title: "Parcelas inválidas",
        description: "Defina pelo menos 1 parcela para gerar os lançamentos automáticos.",
        variant: "destructive",
      });
      return;
    }

    await handleSubmitLogic();
  };

  const handleEdit = (loan: any) => {
    setEditingId(loan.id);
    // Extrair título e descrição se houver separador " - "
    const desc = loan.description || "";
    const parts = desc.split(" - ");
    const title = parts.length > 1 ? parts[0] : "";
    const description = parts.length > 1 ? parts.slice(1).join(" - ") : desc;
    
    setFormData({
      title: title,
      description: description,
      amount: loan.amount.toString(),
      type: loan.type || "Empréstimo",
      status: loan.status || "Ativo",
      due_date: loan.due_date || "",
      installments: loan.installments ? String(loan.installments) : "1",
      first_installment_date: loan.first_installment_date || loan.due_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      amount: "",
      type: "Empréstimo",
      status: "Ativo",
      due_date: "",
      installments: "1",
      first_installment_date: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      amount: "",
      type: "Empréstimo",
      status: "Ativo",
      due_date: "",
      installments: "1",
      first_installment_date: "",
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-accent/10 text-accent";
      case "Quitado":
        return "bg-success/10 text-success";
      case "Atrasado":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Empréstimos"
        description="Gerencie empréstimos e recebíveis"
        action={{
          label: "Novo Empréstimo",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total de Empréstimos"
          value={stats.total}
          icon={DollarSign}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Empréstimos Dados"
          value={stats.emprestimosDados}
          icon={TrendingDown}
          className="bg-gradient-to-br from-destructive/10 to-destructive/5"
          onClick={() => {
            setSelectedStat("dados");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Empréstimos Recebidos"
          value={stats.emprestimosRecebidos}
          icon={TrendingUp}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("recebidos");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Ativos"
          value={stats.ativos}
          icon={CheckCircle2}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("ativos");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          className="bg-gradient-to-br from-warning/10 to-warning/5"
          onClick={() => {
            setSelectedStat("value");
            setDetailsDialogOpen(true);
          }}
        />
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-4 border-2 border-border/50 rounded-2xl shadow-elegant-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
        <SmartSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por descrição, tipo, status..."
        />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Quitado">Quitado</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="loan_given">Empréstimo Dado</SelectItem>
                  <SelectItem value="loan_received">Empréstimo Recebido</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportPDF} className="gap-2 shadow-elegant hover:shadow-elegant-lg">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="gap-2 shadow-sm hover:shadow-elegant">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </div>
          </div>
        {searchTerm && (
            <div className="mt-3 text-sm text-muted-foreground">
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "empréstimo" : "empréstimos"}
          </div>
        )}
        </CardContent>
      </Card>

      <ScrollAwareContainer
        className="bg-card rounded-2xl shadow-elegant-lg border border-border/50"
        contentClassName="overflow-x-auto"
      >
        <Table className="w-full border-separate border-spacing-0 min-w-[800px]">
          <TableHeader>
            <TableRow className="border-b-2 border-destructive/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">Descrição</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Tipo</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Status</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Vencimento</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Valor</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLoans?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <span className="font-medium">Nenhum empréstimo cadastrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedLoans?.map((loan, index) => (
                <TableRow key={loan.id} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}>
                  <TableCell className="font-semibold text-foreground max-w-[200px] truncate border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">{loan.description}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{loan.type}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold shadow-sm whitespace-nowrap ${getStatusColor(loan.status || "")} ${
                      loan.status === "Ativo" ? "bg-success/20" :
                      loan.status === "Quitado" ? "bg-primary/20" :
                      loan.status === "Vencido" ? "bg-destructive/20" :
                      "bg-muted/20"
                    }`}>
                      {loan.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {loan.due_date ? format(new Date(loan.due_date), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-center font-bold text-destructive border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {formatCurrency(loan.amount)}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(loan)}
                              className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar empréstimo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                              onClick={() => handleDelete(loan.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir empréstimo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollAwareContainer>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Empréstimo" : "Novo Empréstimo"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do empréstimo abaixo." : "Preencha os dados para cadastrar um novo empréstimo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, title: value }))}
                placeholder="Ex: Empréstimo Banco X"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, description: value }))}
                rows={2}
                placeholder="Detalhes adicionais sobre o empréstimo..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Empréstimo">Empréstimo</SelectItem>
                    <SelectItem value="Recebível">Recebível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Quantidade de parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min={1}
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_installment_date">Primeira parcela em</Label>
                <Input
                  id="first_installment_date"
                  type="date"
                  value={formData.first_installment_date}
                  onChange={(e) => setFormData({ ...formData, first_installment_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Usaremos esta data para lançar receitas ou despesas automaticamente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Quitado">Quitado</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes das Estatísticas */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStat === "total" && "Detalhes - Total de Empréstimos"}
              {selectedStat === "dados" && "Detalhes - Empréstimos Dados"}
              {selectedStat === "recebidos" && "Detalhes - Empréstimos Recebidos"}
              {selectedStat === "ativos" && "Detalhes - Empréstimos Ativos"}
              {selectedStat === "value" && "Detalhes - Valor Total"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todos os ${stats.total} empréstimos cadastrados.`}
              {selectedStat === "dados" && `Lista dos ${stats.emprestimosDados} empréstimos dados.`}
              {selectedStat === "recebidos" && `Lista dos ${stats.emprestimosRecebidos} empréstimos recebidos.`}
              {selectedStat === "ativos" && `Lista dos ${stats.ativos} empréstimos ativos.`}
              {selectedStat === "value" && `Detalhamento do valor total de R$ ${formatCurrency(stats.totalValue)}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStat === "total" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans?.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.description || "-"}</TableCell>
                        <TableCell>{loan.type === "loan_given" ? "Empréstimo Dado" : loan.type === "loan_received" ? "Empréstimo Recebido" : loan.type || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(loan.status)}>
                            {loan.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{loan.amount ? formatCurrency(loan.amount) : "-"}</TableCell>
                        <TableCell>{loan.due_date ? format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Adicionar outros casos de selectedStat conforme necessário */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita e pode afetar registros relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

