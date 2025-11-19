import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/layout/StatsCard";
import { ScrollAwareContainer } from "@/components/layout/ScrollAwareContainer";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { ClientSearchInput } from "@/components/ClientSearchInput";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Scale, Download, FileText, TrendingUp, Calendar, CheckCircle2, XCircle, DollarSign, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput, formatCurrencyInput, parseCurrency } from "@/lib/validations";
import * as XLSX from "xlsx";

type ParcelConfig = {
  installments: number;
  totalAmount: number;
  firstDate: string;
  recurring: boolean;
};

type CreateProcessInput = {
  processData: any;
  parcelConfig?: ParcelConfig | null;
};

export default function Processos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sentenceFilter, setSentenceFilter] = useState<string>("all");
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    client_id: "",
    process_number: "",
    description: "",
    status: "active",
    has_sentence: false,
    estimated_value: "",
    payment_forecast: "",
    parcelar: false,
    qtdParcelas: "",
    recorrente: false,
  });

  const [revenueFormData, setRevenueFormData] = useState({
    description: "",
    amount: "",
    date: "",
    frequency: "",
    installments: "",
    category: "Processo Judicial",
  });

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "person",
  });

  const { data: processes } = useQuery({
    queryKey: ["legal_processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_processes")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredProcesses, resultCount, totalCount } = useSmartSearch(
    processes,
    ["description", "process_number", "clients"]
  );

  // Aplicar filtros adicionais
  const filteredByStatus = useMemo(() => {
    if (!filteredProcesses) return [];
    let result = filteredProcesses;
    
    if (statusFilter !== "all") {
      result = result.filter((p: any) => p.status === statusFilter);
    }
    
    if (sentenceFilter !== "all") {
      const hasSentence = sentenceFilter === "true";
      result = result.filter((p: any) => (p.has_sentence || false) === hasSentence);
    }
    
    return result;
  }, [filteredProcesses, statusFilter, sentenceFilter]);

  const { sortedData: sortedProcesses, SortButton } = useTableSort(filteredByStatus);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const quickClientMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: standardizeText(newClientData.name),
        email: newClientData.email?.trim() || null,
        phone: newClientData.phone?.trim() || null,
        type: newClientData.type,
      };

      const { data, error } = await supabase.from("clients").insert([payload]).select("id, name").single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (createdClient) => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente cadastrado com sucesso!" });
      setFormData((prev) => ({ ...prev, client_id: createdClient.id }));
      setIsClientDialogOpen(false);
      setNewClientData({
        name: "",
        email: "",
        phone: "",
        type: "person",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error?.message || "Não foi possível salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createRevenueMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("revenue").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast({ title: "Receita cadastrada com sucesso!" });
      setRevenueDialogOpen(false);
      setRevenueFormData({
        description: "",
        amount: "",
        date: "",
        frequency: "",
        installments: "",
        category: "Processo Judicial",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar receita",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Estatísticas
  const stats = useMemo(() => {
    if (!processes) return { total: 0, withSentence: 0, totalValue: 0, active: 0, pending: 0, closed: 0 };
    
    return {
      total: processes.length,
      withSentence: processes.filter((p: any) => p.has_sentence).length,
      totalValue: processes.reduce((sum: number, p: any) => sum + (p.estimated_value || 0), 0),
      active: processes.filter((p: any) => p.status === "active").length,
      pending: processes.filter((p: any) => p.status === "pending").length,
      closed: processes.filter((p: any) => p.status === "closed").length,
    };
  }, [processes]);

  const createMutation = useMutation({
    mutationFn: async ({ processData }: CreateProcessInput) => {
      const { data, error } = await supabase
        .from("legal_processes")
        .insert([processData])
        .select("*, clients(name)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (createdProcess, { parcelConfig }) => {
      await queryClient.invalidateQueries({ queryKey: ["legal_processes"] });
      // toast({ title: "Processo cadastrado com sucesso!" });

      if (parcelConfig) {
        try {
          await generateRevenuesFromProcess(createdProcess, parcelConfig);
        } catch (error: any) {
          toast({
            title: "Receitas não geradas",
            description: error?.message || "Não foi possível criar as parcelas automaticamente.",
            variant: "destructive",
          });
        }
      }

      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar processo",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("legal_processes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["legal_processes"] });
      toast({ title: "Processo atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar processo",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("legal_processes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["legal_processes"] });
      toast({ title: "Processo excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setProcessToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir processo",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.description.trim()) {
      toast({
        title: "Erro de validação",
        description: "A descrição do processo é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (formData.parcelar) {
      if (!formData.estimated_value) {
        toast({
          title: "Valor estimado obrigatório",
          description: "Informe o valor estimado para poder parcelar o recebimento.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.qtdParcelas || parseInt(formData.qtdParcelas, 10) < 1) {
        toast({
          title: "Quantidade de parcelas inválida",
          description: "Defina pelo menos 1 parcela para gerar as receitas automáticas.",
          variant: "destructive",
        });
        return;
      }
    }

    const data: any = {
      client_id: formData.client_id || null,
      process_number: formData.process_number ? standardizeText(formData.process_number) : null,
      description: standardizeText(formData.description),
      status: formData.status || "active",
      has_sentence: formData.has_sentence || false,
      estimated_value: formData.estimated_value ? parseCurrency(formData.estimated_value) : null,
      payment_forecast: formData.payment_forecast || null,
    };

    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === undefined) {
        data[key] = null;
      }
    });

    let parcelConfig: ParcelConfig | null = null;

    if (formData.parcelar) {
      const installmentsCount = Math.max(1, parseInt(formData.qtdParcelas || "1", 10));
      const totalAmount = parseCurrency(formData.estimated_value || "0");

      if (!totalAmount || totalAmount <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor estimado deve ser maior que zero para gerar parcelas.",
          variant: "destructive",
        });
        return;
      }

      parcelConfig = {
        installments: installmentsCount,
        totalAmount,
        firstDate: formData.payment_forecast || format(new Date(), "yyyy-MM-dd"),
        recurring: formData.recorrente,
      };
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate({ processData: data, parcelConfig });
    }
  };

  const handleEdit = (process: any) => {
    setEditingId(process.id);
    setFormData({
      client_id: process.client_id || "",
      process_number: process.process_number || "",
      description: process.description || "",
      status: process.status || "active",
      has_sentence: process.has_sentence || false,
      estimated_value: process.estimated_value ? formatCurrencyInput(process.estimated_value.toString()) : "",
      payment_forecast: process.payment_forecast || "",
      parcelar: false,
      qtdParcelas: "",
      recorrente: false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProcessToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (processToDelete) {
      deleteMutation.mutate(processToDelete);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      client_id: "",
      process_number: "",
      description: "",
      status: "active",
      has_sentence: false,
      estimated_value: "",
      payment_forecast: "",
      parcelar: false,
      qtdParcelas: "",
      recorrente: false,
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      client_id: "",
      process_number: "",
      description: "",
      status: "active",
      has_sentence: false,
      estimated_value: "",
      payment_forecast: "",
      parcelar: false,
      qtdParcelas: "",
      recorrente: false,
    });
    setIsDialogOpen(true);
  };

  const handleQuickClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newClientData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe ao menos o nome do cliente para continuar.",
        variant: "destructive",
      });
      return;
    }

    quickClientMutation.mutate();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const generateRevenuesFromProcess = async (process: any, parcelConfig: ParcelConfig) => {
    if (!parcelConfig.totalAmount || parcelConfig.totalAmount <= 0) return;

    const installments = Math.max(1, parcelConfig.installments);
    const baseAmount = parcelConfig.totalAmount / installments;
    const firstDate = parcelConfig.firstDate || format(new Date(), "yyyy-MM-dd");

    const entries = Array.from({ length: installments }, (_, index) => {
      const installmentDate = addMonths(new Date(firstDate), index);
      return {
        description: standardizeText(
          `${process.description || "Processo"}${installments > 1 ? ` - Parcela ${index + 1}/${installments}` : ""}`
        ),
        amount: Number(baseAmount.toFixed(2)),
        date: format(installmentDate, "yyyy-MM-dd"),
        category: "Processo Judicial",
        classification: "Processo Judicial",
        client_id: process.client_id || null,
        frequency: parcelConfig.recurring
          ? "Mensal Fixo"
          : installments > 1
            ? "Mensal Tempo Determinado"
            : "Única",
        installments: parcelConfig.recurring
          ? null
          : installments > 1
            ? installments
            : null,
      };
    });

    const { error } = await supabase.from("revenue").insert(entries);
    if (error) throw error;

    await queryClient.invalidateQueries({ queryKey: ["revenues"] });
    toast({
      title: "Receitas geradas automaticamente",
      description:
        installments > 1
          ? `${installments} parcelas foram adicionadas na aba de receitas.`
          : "1 lançamento foi adicionado na aba de receitas.",
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "ATIVO", className: "bg-success/20 text-success" },
      pending: { label: "PENDENTE", className: "bg-warning/20 text-warning" },
      closed: { label: "ENCERRADO", className: "bg-muted/20 text-muted-foreground" },
    };
    
    const statusInfo = statusMap[status || "active"] || statusMap.active;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold shadow-sm whitespace-nowrap ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleExportPDF = () => {
    if (!sortedProcesses || sortedProcesses.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar.",
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
      doc.text("Relatório de Processos", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = sortedProcesses.map((process: any) => [
        process.process_number || "",
        process.clients?.name || "",
        process.description || "",
        process.status === "active" ? "ATIVO" : process.status === "pending" ? "PENDENTE" : "ENCERRADO",
        process.has_sentence ? "SIM" : "NÃO",
        formatCurrency(Number(process.estimated_value) || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Número", "Cliente", "Descrição", "Status", "Sentença", "Valor Estimado"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Processos_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!sortedProcesses || sortedProcesses.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = sortedProcesses.map((process: any) => ({
      "Número do Processo": process.process_number || "",
      "Cliente": process.clients?.name || "",
      "Descrição": process.description || "",
      "Status": process.status === "active" ? "ATIVO" : process.status === "pending" ? "PENDENTE" : "ENCERRADO",
      "Possui Sentença": process.has_sentence ? "SIM" : "NÃO",
      "Valor Estimado": process.estimated_value || 0,
      "Previsão Pagamento": process.payment_forecast ? format(new Date(process.payment_forecast), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Data de Criação": format(new Date(process.created_at), "dd/MM/yyyy", { locale: ptBR }),
      "Última Atualização": format(new Date(process.updated_at), "dd/MM/yyyy", { locale: ptBR }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Processos");
    
    const fileName = `Processos_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
    });
  };

  const handleOpenRevenueDialog = (process: any) => {
    setSelectedProcess(process);
    setRevenueFormData({
      description: `Recebimento Processo ${process.process_number || process.description.substring(0, 30)}`,
      amount: process.estimated_value ? formatCurrencyInput(process.estimated_value.toString()) : "",
      date: process.payment_forecast || format(new Date(), "yyyy-MM-dd"),
      frequency: "",
      installments: "",
      category: "Processo Judicial",
    });
    setRevenueDialogOpen(true);
  };

  const handleSubmitRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revenueFormData.description || !revenueFormData.amount) {
      toast({
        title: "Erro de validação",
        description: "Descrição e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const baseAmount = parseCurrency(revenueFormData.amount);
    if (!baseAmount || baseAmount <= 0) {
      toast({
        title: "Erro de validação",
        description: "Valor inválido.",
        variant: "destructive",
      });
      return;
    }

    const startDate = revenueFormData.date ? new Date(revenueFormData.date) : new Date();
    const installmentsCount = revenueFormData.installments ? parseInt(revenueFormData.installments) : 1;
    const amountPerInstallment = baseAmount / installmentsCount;

    const revenuesToCreate = [];
    for (let i = 0; i < installmentsCount; i++) {
      const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      revenuesToCreate.push({
        description: standardizeText(
          `${revenueFormData.description}${installmentsCount > 1 ? ` - Parcela ${i + 1}/${installmentsCount}` : ""}`
        ),
        amount: amountPerInstallment,
        date: format(installmentDate, "yyyy-MM-dd"),
        category: revenueFormData.category || "Processo Judicial",
        classification: "Processo Judicial",
        client_id: selectedProcess?.client_id || null,
        frequency: revenueFormData.frequency || "Única",
        installments: installmentsCount > 1 ? installmentsCount.toString() : null,
      });
    }

    try {
      for (const revenue of revenuesToCreate) {
        await createRevenueMutation.mutateAsync(revenue);
      }
      await queryClient.invalidateQueries({ queryKey: ["revenues"] });
    } catch (error: any) {
      console.error("Erro ao criar receitas:", error);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Escritórios e Processos"
        description="Acompanhe todos os processos jurídicos e suas informações"
        action={{
          label: "Novo Processo",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total de Processos"
          value={String(stats.total)}
          icon={Scale}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Com Sentença"
          value={String(stats.withSentence)}
          icon={CheckCircle2}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("sentence");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Valor Total Estimado"
          value={formatCurrency(stats.totalValue)}
          icon={TrendingUp}
          className="bg-gradient-to-br from-warning/10 to-warning/5"
          onClick={() => {
            setSelectedStat("value");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Processos Ativos"
          value={String(stats.active)}
          icon={FileText}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("active");
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
                placeholder="Buscar por número do processo, descrição ou cliente..."
        />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="closed">Encerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sentenceFilter} onValueChange={setSentenceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sentença" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Com Sentença</SelectItem>
                  <SelectItem value="false">Sem Sentença</SelectItem>
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
          {(searchTerm || statusFilter !== "all" || sentenceFilter !== "all") && (
            <div className="mt-3 text-sm text-muted-foreground">
              Mostrando {sortedProcesses?.length || 0} de {totalCount} {totalCount === 1 ? "processo" : "processos"}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <ScrollAwareContainer
        className="bg-card rounded-2xl shadow-elegant-lg border border-border/50"
        contentClassName="overflow-x-auto"
      >
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1">
                  Número
                  <SortButton column="process_number">Número</SortButton>
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  Cliente
                  <SortButton column="client_id">Cliente</SortButton>
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[150px]">
                Descrição
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[90px]">
                <div className="flex items-center justify-center gap-1">
                  Status
                  <SortButton column="status">Status</SortButton>
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[90px]">
                Sentença
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  Previsão
                  <SortButton column="payment_forecast">Previsão</SortButton>
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  Valor Estimado
                  <SortButton column="estimated_value">Valor Estimado</SortButton>
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm w-20 text-center">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProcesses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <Scale className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Nenhum processo encontrado</span>
                    <span className="text-sm text-muted-foreground/60">
                      {searchTerm || statusFilter !== "all" || sentenceFilter !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Cadastre um novo processo para começar"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedProcesses?.map((process: any, index: number) => (
                <TableRow 
                  key={process.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onDoubleClick={() => handleEdit(process)}
                >
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm text-center">
                    {process.process_number ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {process.process_number}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm max-w-[120px] truncate text-center">
                    {process.clients?.name || "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[200px] truncate border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm">
                    {process.description || "-"}
                  </TableCell>
                  <TableCell className="border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm text-center">
                    {getStatusBadge(process.status)}
                  </TableCell>
                  <TableCell className="border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm text-center">
                    {process.has_sentence ? (
                      <Badge className="bg-success/20 text-success hover:bg-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        SIM
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="w-3 h-3 mr-1" />
                        NÃO
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                    {process.payment_forecast ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{format(new Date(process.payment_forecast), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(process.payment_forecast) < new Date() ? "Vencido" : ""}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-success border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    {process.estimated_value ? formatCurrency(process.estimated_value) : "-"}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm w-24">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenRevenueDialog(process)}
                        aria-label="Cadastrar receita"
                        title="Cadastrar receita relacionada"
                        className="h-8 w-8 text-success hover:text-success"
                      >
                        <DollarSign className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(process)}
                        aria-label="Editar processo"
                        title="Editar processo"
                        className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(process.id)}
                        aria-label="Excluir processo"
                        title="Excluir processo"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollAwareContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Processo" : "Novo Processo"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do processo abaixo." : "Preencha os dados para cadastrar um novo processo jurídico."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <ClientSearchInput
                    value={formData.client_id}
                    onChange={(value) => setFormData({ ...formData, client_id: value })}
                    clients={clients}
                    isLoading={!clients}
                    placeholder="Buscar cliente cadastrado..."
                    emptyStateAction={
                      <Button type="button" size="sm" onClick={() => setIsClientDialogOpen(true)}>
                        Cadastrar cliente
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={() => setIsClientDialogOpen(true)}
                  >
                    + Cadastrar Cliente
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Conecte o processo a um cliente existente ou cadastre um novo em segundos.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="process_number">Número do Processo</Label>
                <Input
                  id="process_number"
                  value={formData.process_number}
                  onChange={(e) => setFormData({ ...formData, process_number: e.target.value })}
                  onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, process_number: value }))}
                  placeholder="Ex: 0000123-45.2023.8.26.0100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Processo *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, description: value }))}
                rows={4}
                placeholder="Descreva o processo jurídico..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status do Processo</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="closed">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="has_sentence">Possui Sentença?</Label>
                <Select 
                  value={formData.has_sentence ? "true" : "false"} 
                  onValueChange={(value) => setFormData({ ...formData, has_sentence: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="true">SIM</SelectItem>
                    <SelectItem value="false">NÃO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Valor Estimado (R$)</Label>
                <Input
                  id="estimated_value"
                  type="text"
                  value={formData.estimated_value}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setFormData({ ...formData, estimated_value: formatted });
                  }}
                  placeholder="0,00"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Label>Parcelar?</Label>
                  <Select value={formData.parcelar ? "sim" : "nao"} onValueChange={(value) => setFormData({ ...formData, parcelar: value === "sim" })}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.parcelar && (
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={formData.qtdParcelas || ""}
                      onChange={(e) => setFormData({ ...formData, qtdParcelas: e.target.value })}
                      placeholder="Qtd. parcelas"
                      className="w-[120px]"
                    />
                  )}
                </div>
                {formData.parcelar && (
                  <div className="flex items-center gap-2 mt-2">
                    <Label>Gerar como receita recorrente?</Label>
                    <Select value={formData.recorrente ? "sim" : "nao"} onValueChange={(value) => setFormData({ ...formData, recorrente: value === "sim" })}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao">Não</SelectItem>
                        <SelectItem value="sim">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_forecast">Previsão de Pagamento</Label>
                <Input
                  id="payment_forecast"
                  type="date"
                  value={formData.payment_forecast}
                  onChange={(e) => setFormData({ ...formData, payment_forecast: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.
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

      {/* Dialog de Cadastro de Receita Relacionada */}
      <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Receita do Processo</DialogTitle>
            <DialogDescription>
              Cadastre uma receita relacionada ao processo {selectedProcess?.process_number || selectedProcess?.description?.substring(0, 50)}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRevenue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revenue_description">Descrição *</Label>
              <Input
                id="revenue_description"
                value={revenueFormData.description}
                onChange={(e) => setRevenueFormData({ ...revenueFormData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue_amount">Valor (R$) *</Label>
                <Input
                  id="revenue_amount"
                  type="text"
                  value={revenueFormData.amount}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setRevenueFormData({ ...revenueFormData, amount: formatted });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue_date">Data *</Label>
                <Input
                  id="revenue_date"
                  type="date"
                  value={revenueFormData.date}
                  onChange={(e) => setRevenueFormData({ ...revenueFormData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue_frequency">Frequência</Label>
                <Select 
                  value={revenueFormData.frequency} 
                  onValueChange={(value) => setRevenueFormData({ ...revenueFormData, frequency: value, installments: value ? revenueFormData.installments : "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Única" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Única</SelectItem>
                    <SelectItem value="Mensal Fixo">Mensal Fixo</SelectItem>
                    <SelectItem value="Mensal Tempo Determinado">Mensal Tempo Determinado</SelectItem>
                    <SelectItem value="Anual Fixo">Anual Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {revenueFormData.frequency && revenueFormData.frequency.includes("Tempo Determinado") && (
                <div className="space-y-2">
                  <Label htmlFor="revenue_installments">Parcelas</Label>
                  <Input
                    id="revenue_installments"
                    type="number"
                    min="1"
                    value={revenueFormData.installments}
                    onChange={(e) => setRevenueFormData({ ...revenueFormData, installments: e.target.value })}
                    placeholder="Ex: 12"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setRevenueDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createRevenueMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Receita
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Cadastro Rápido de Cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre rapidamente um cliente sem sair desta tela.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickClientSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick_client_name">Nome *</Label>
              <Input
                id="quick_client_name"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quick_client_email">E-mail</Label>
                <Input
                  id="quick_client_email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                  placeholder="exemplo@cliente.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick_client_phone">Telefone</Label>
                <Input
                  id="quick_client_phone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick_client_type">Tipo</Label>
              <Select
                value={newClientData.type}
                onValueChange={(value) => setNewClientData({ ...newClientData, type: value })}
              >
                <SelectTrigger id="quick_client_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Pessoa Física</SelectItem>
                  <SelectItem value="company">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={quickClientMutation.isPending}>
                {quickClientMutation.isPending ? "Salvando..." : "Salvar cliente"}
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
              {selectedStat === "total" && "Detalhes - Total de Processos"}
              {selectedStat === "sentence" && "Detalhes - Processos com Sentença"}
              {selectedStat === "value" && "Detalhes - Valor Total Estimado"}
              {selectedStat === "active" && "Detalhes - Processos Ativos"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todos os ${stats.total} processos cadastrados.`}
              {selectedStat === "sentence" && `Lista dos ${stats.withSentence} processos com sentença.`}
              {selectedStat === "value" && `Detalhamento do valor total estimado de R$ ${formatCurrency(stats.totalValue)}.`}
              {selectedStat === "active" && `Lista dos ${stats.active} processos ativos.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStat === "total" && (
              <ScrollAwareContainer contentClassName="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes?.map((process: any) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">{process.process_number || "-"}</TableCell>
                        <TableCell>{process.clients?.name || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{process.description || "-"}</TableCell>
                        <TableCell>{getStatusBadge(process.status)}</TableCell>
                        <TableCell>{process.estimated_value ? formatCurrency(process.estimated_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollAwareContainer>
            )}
            {selectedStat === "sentence" && (
              <ScrollAwareContainer contentClassName="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes?.filter((p: any) => p.has_sentence).map((process: any) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">{process.process_number || "-"}</TableCell>
                        <TableCell>{process.clients?.name || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{process.description || "-"}</TableCell>
                        <TableCell>{process.estimated_value ? formatCurrency(process.estimated_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollAwareContainer>
            )}
            {selectedStat === "value" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Valor Total</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalValue)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Processos com Valor</p>
                      <p className="text-2xl font-bold">{processes?.filter((p: any) => p.estimated_value).length || 0}</p>
                    </CardContent>
                  </Card>
                </div>
                <ScrollAwareContainer contentClassName="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor Estimado</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processes?.filter((p: any) => p.estimated_value).sort((a: any, b: any) => (b.estimated_value || 0) - (a.estimated_value || 0)).map((process: any) => (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">{process.process_number || "-"}</TableCell>
                          <TableCell>{process.clients?.name || "-"}</TableCell>
                          <TableCell className="font-bold text-success">{formatCurrency(process.estimated_value)}</TableCell>
                          <TableCell>{getStatusBadge(process.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollAwareContainer>
              </div>
            )}
            {selectedStat === "active" && (
              <ScrollAwareContainer contentClassName="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes?.filter((p: any) => p.status === "active").map((process: any) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">{process.process_number || "-"}</TableCell>
                        <TableCell>{process.clients?.name || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{process.description || "-"}</TableCell>
                        <TableCell>{process.estimated_value ? formatCurrency(process.estimated_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollAwareContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

