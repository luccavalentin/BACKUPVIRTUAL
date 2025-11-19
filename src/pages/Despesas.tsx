import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/layout/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { Pencil, Trash2, TrendingDown, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Despesas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "", // "A partir de..." (opcional)
    category: "",
    frequency: "", // Vazio por padrão = "Anual Fixo"
    frequency_type: "", // "tempo_determinado" ou vazio
    installments: "", // Quantidade de parcelas
    status: "PENDENTE",
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, clients(name)");
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredExpenses, resultCount, totalCount } = useSmartSearch(
    expenses,
    ["description", "category", "status"]
  );


  const { sortedData: sortedExpenses, SortButton } = useTableSort(filteredExpenses);

  // Calcular dados para o gráfico de pizza por categoria
  const expenseByCategory = useMemo(() => {
    if (!expenses) return [];
    
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach((expense: any) => {
      const category = expense.category || "Sem Categoria";
      const amount = Number(expense.amount) || 0;
      
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += amount;
    });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];


  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("expenses").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Despesa cadastrada com sucesso!" });
      if (keepDialogOpen) {
        // Limpar formulário mas manter dialog aberto
        setFormData({
          description: "",
          amount: "",
          date: "",
          category: "",
          frequency: "",
          frequency_type: "",
          installments: "",
          status: "PENDENTE",
        });
        setKeepDialogOpen(false);
      } else {
      handleCloseDialog();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar despesa",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("expenses").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Despesa atualizada com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Despesa excluída com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir despesa",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeepDialogOpen(false);
    await handleSubmitLogic();
  };
    
  const handleSubmitLogic = async () => {
    try {
      // Limpar campos vazios e converter para null
      // Construir a frequency completa baseada no tipo
      // Se não selecionar nada, considerar "Anual Fixo"
      let frequencyValue = formData.frequency || "Anual";
      let frequencyType = formData.frequency_type || "";
      
      // Se não selecionou tipo e é Mensal ou Anual, considerar Fixo
      if ((formData.frequency === "Mensal" || formData.frequency === "Anual") && !frequencyType) {
        frequencyType = "fixo";
      }
      
      // Se não selecionou periodicidade, considerar "Anual Fixo"
      if (!formData.frequency) {
        frequencyValue = "Anual";
        frequencyType = "fixo";
      }
      
      if (frequencyValue === "Mensal" || frequencyValue === "Anual") {
        if (frequencyType === "fixo") {
          frequencyValue = frequencyValue === "Mensal" ? "Mensal Fixo" : "Anual Fixo";
        } else if (frequencyType === "tempo_determinado") {
          if (!formData.installments || parseInt(formData.installments) < 1) {
            toast({
              title: "Erro de validação",
              description: "Por favor, informe a quantidade de parcelas.",
              variant: "destructive",
            });
            return;
          }
          frequencyValue = frequencyValue === "Mensal" 
            ? `Mensal por Tempo Determinado (${formData.installments} parcelas)`
            : `Anual por Tempo Determinado (${formData.installments} parcelas)`;
        }
      }
      
      // Se não preencheu "A partir de...", usar data atual
      const startDate = formData.date || new Date().toISOString().split('T')[0];

      // Garantir que o status seja válido
      const validStatuses = ["PENDENTE", "PAGO", "AGENDADO"];
      const statusValue = formData.status && validStatuses.includes(formData.status) 
        ? formData.status 
        : "PENDENTE";

      const data: any = {
        description: formData.description ? standardizeText(formData.description) : null,
        category: formData.category ? standardizeText(formData.category) : null,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        date: startDate, // Usa "A partir de..." se preenchido, senão data atual
        frequency: frequencyValue,
        installments: frequencyType === "tempo_determinado" && formData.installments 
          ? parseInt(formData.installments) 
          : null,
        status: statusValue,
      };

      // Remove campos undefined ou string vazia (exceto status que já foi validado)
      Object.keys(data).forEach(key => {
        if (key !== "status" && (data[key] === "" || data[key] === undefined)) {
          data[key] = null;
        }
      });

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      console.error("Erro ao salvar despesa:", error);
      // Erro já é tratado no onError da mutation
    }
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    // Parse da frequency para separar tipo e periodicidade
    const frequency = expense.frequency || "Única";
    let frequency_type = "";
    let installments = "";
    
    if (frequency.includes("Fixo")) {
      frequency_type = "fixo";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          category: expense.category || "",
          frequency: "Mensal",
          frequency_type: "fixo",
          installments: "",
          status: expense.status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          category: expense.category || "",
          frequency: "Anual",
          frequency_type: "fixo",
          installments: "",
          status: expense.status || "PENDENTE",
        });
      }
    } else if (frequency.includes("Tempo Determinado")) {
      frequency_type = "tempo_determinado";
      installments = expense.installments?.toString() || "";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          category: expense.category || "",
          frequency: "Mensal",
          frequency_type: "tempo_determinado",
          installments: installments,
          status: expense.status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          category: expense.category || "",
          frequency: "Anual",
          frequency_type: "tempo_determinado",
          installments: installments,
          status: expense.status || "PENDENTE",
        });
      }
    } else {
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category || "",
        frequency: frequency,
        frequency_type: "",
        installments: "",
        status: expense.status || "PENDENTE",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      date: "",
      category: "",
      frequency: "",
      frequency_type: "",
      installments: "",
      status: "PENDENTE",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      date: "",
      category: "",
      frequency: "",
      frequency_type: "",
      installments: "",
      status: "PENDENTE",
    });
    setIsDialogOpen(true);
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAGO":
        return "bg-success/10 text-success";
      case "PENDENTE":
        return "bg-warning/10 text-warning";
      case "AGENDADO":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const handleExportPDF = () => {
    if (!sortedExpenses || sortedExpenses.length === 0) {
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

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Despesas", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Preparar dados da tabela
      const tableData = sortedExpenses.map((expense) => [
        format(new Date(expense.date), "dd/MM/yyyy"),
        expense.description || "",
        expense.category || "",
        expense.clients?.name || "",
        expense.status || "",
        formatCurrency(Number(expense.amount) || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Descrição", "Categoria", "Fornecedor", "Status", "Valor"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Despesas_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!sortedExpenses || sortedExpenses.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = sortedExpenses.map((expense) => ({
      Data: format(new Date(expense.date), "dd/MM/yyyy"),
      Descrição: expense.description || "",
      Categoria: expense.category || "",
      Fornecedor: expense.clients?.name || "",
      Status: expense.status || "",
      Valor: expense.amount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despesas");
    
    const fileName = `Despesas_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Despesas"
        description="Gerencie todas as despesas e pagamentos"
        action={{
          label: "Nova Despesa",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      <div className="mb-4 flex items-center justify-end gap-2">
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

      <div className="mb-6">
        <Card 
          className="border-2 border-destructive/50 rounded-2xl shadow-elegant-lg bg-gradient-card overflow-visible cursor-pointer hover:scale-[1.01] transition-all duration-300"
          onClick={() => setDetailsDialogOpen(true)}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Total de Despesas */}
              <div className="flex items-center justify-between w-full lg:w-auto lg:min-w-[200px]">
                <div className="space-y-2 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-destructive">
                    TOTAL DE DESPESAS
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-none text-destructive">
                    {totalCount.toString()}
                  </p>
                </div>
                <div className="relative p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm bg-destructive/10 text-destructive flex-shrink-0 ml-2 sm:ml-4">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Gráfico de Pizza */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-foreground">Origem das Despesas</p>
                </div>
                {expenseByCategory.length > 0 ? (
                  <div className="w-full overflow-visible">
                    <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 250} className="min-h-[200px] md:min-h-[250px]">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => {
                            if (value === 0) return '';
                            return `${name}: ${(percent * 100).toFixed(0)}%`;
                          }}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.75rem',
                            padding: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    <p>Nenhuma despesa cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <SmartSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por descrição, categoria, status..."
        />
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "despesa" : "despesas"}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-destructive/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">Data</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Descrição</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Categoria</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Fornecedor</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Status</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Valor</TableHead>
              <TableHead className="bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <span className="font-medium">Nenhuma despesa cadastrada</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses?.map((expense, index) => (
                <TableRow 
                  key={expense.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onDoubleClick={() => handleEdit(expense)}
                >
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[120px] truncate text-center">{expense.description}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{expense.category || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[100px] truncate text-center">{expense.clients?.name || "-"}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(expense.status || "")}`}>
                      {expense.status || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-destructive border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                        aria-label="Editar despesa"
                        title="Editar despesa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(expense.id)}
                        aria-label="Excluir despesa"
                        title="Excluir despesa"
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados da despesa abaixo." : "Preencha os dados para cadastrar uma nova despesa."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, description: value }))}
                />
              </div>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">A partir de... (Opcional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="Deixe vazio para começar hoje"
                />
                <p className="text-xs text-muted-foreground">
                  Se preenchido, a recorrência começa nesta data. Se vazio, começa hoje.
                </p>
              </div>
              {formData.frequency === "Única" && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || "PENDENTE"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                      <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category || "none"} onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="Arrendamento">Arrendamento</SelectItem>
                    <SelectItem value="Funcionários">Funcionários</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Empréstimos">Empréstimos</SelectItem>
                    <SelectItem value="Investimentos Gado">Investimentos Gado</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Periodicidade</Label>
                <Select 
                  value={formData.frequency || "none"} 
                  onValueChange={(value) => {
                    // Resetar tipo e parcelas quando mudar a periodicidade principal
                    setFormData({ 
                      ...formData, 
                      frequency: value === "none" ? "" : value,
                      frequency_type: "",
                      installments: ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (Anual Fixo por padrão)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Nenhuma (Anual Fixo por padrão)</SelectItem>
                    <SelectItem value="Única">Única</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.frequency === "Mensal" || formData.frequency === "Anual") ? (
                <div className="space-y-2">
                  <Label htmlFor="frequency_type">Tipo de Periodicidade</Label>
                  <Select 
                    value={formData.frequency_type || "none"} 
                    onValueChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        frequency_type: value === "none" ? "" : value,
                        installments: value === "tempo_determinado" ? formData.installments : ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="none">Nenhum (será considerado Fixo)</SelectItem>
                      <SelectItem value="tempo_determinado">{formData.frequency === "Mensal" ? "Mensal por Tempo Determinado" : "Anual por Tempo Determinado"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Se não selecionar, será considerado {formData.frequency === "Mensal" ? "Mensal Fixo" : "Anual Fixo"}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || "PENDENTE"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                      <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Campo de Parcelas - aparece quando é por tempo determinado */}
            {formData.frequency_type === "tempo_determinado" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installments">Quantidade de Parcelas *</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    placeholder="Ex: 12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || "PENDENTE"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                      <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

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

      {/* Dialog de Detalhes - Total de Despesas */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes - Total de Despesas</DialogTitle>
            <DialogDescription>
              Lista completa de todas as {totalCount} despesas cadastradas no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{expense.description || "-"}</TableCell>
                    <TableCell>{expense.category || "-"}</TableCell>
                    <TableCell className="font-bold text-destructive">
                      {expense.amount ? formatCurrency(expense.amount) : "-"}
                    </TableCell>
                    <TableCell>{expense.date ? format(new Date(expense.date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                    <TableCell>{expense.frequency || "Única"}</TableCell>
                    <TableCell>
                      <Badge variant={expense.status === "PAGO" ? "default" : expense.status === "PENDENTE" ? "destructive" : "secondary"}>
                        {expense.status || "PENDENTE"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

