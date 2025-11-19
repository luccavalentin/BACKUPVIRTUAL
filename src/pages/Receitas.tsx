import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/layout/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { Pencil, Trash2, Copy, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Receitas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReuseDialogOpen, setIsReuseDialogOpen] = useState(false);
  const [reuseSearchTerm, setReuseSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "", // "A partir de..." (opcional)
    classification: "",
    category: "",
    frequency: "", // Vazio por padrão = "Anual Fixo"
    frequency_type: "", // "tempo_determinado" ou vazio
    installments: "", // Quantidade de parcelas
    documentation_status: "PENDENTE",
  });

  const { data: revenues } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("*, clients(name), properties(address)");
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredRevenues, resultCount, totalCount } = useSmartSearch(
    revenues,
    ["description", "category", "classification"]
  );

  // Busca para reutilizar receitas
  const { filteredData: filteredReuseRevenues } = useSmartSearch(
    revenues,
    ["description", "category", "classification"],
    reuseSearchTerm
  );

  const { sortedData: sortedRevenues, SortButton } = useTableSort(filteredRevenues);

  // Calcular dados para o gráfico de pizza por classificação
  const revenueByClassification = useMemo(() => {
    if (!revenues) return [];
    
    const classificationMap: Record<string, number> = {};
    
    revenues.forEach((revenue: any) => {
      const classification = revenue.classification || "Sem Classificação";
      const amount = Number(revenue.amount) || 0;
      
      if (!classificationMap[classification]) {
        classificationMap[classification] = 0;
      }
      classificationMap[classification] += amount;
    });
    
    return Object.entries(classificationMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [revenues]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];


  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("revenue").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast({ title: "Receita cadastrada com sucesso!" });
      if (keepDialogOpen) {
        // Limpar formulário mas manter dialog aberto
        setFormData({
          description: "",
          amount: "",
          date: "",
          classification: "",
          category: "",
          frequency: "",
          frequency_type: "",
          installments: "",
          documentation_status: "PENDENTE",
        });
        setKeepDialogOpen(false);
      } else {
      handleCloseDialog();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar receita",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("revenue").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast({ title: "Receita atualizada com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar receita",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("revenue").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      toast({ title: "Receita excluída com sucesso!" });
    },
  });

  const handleSubmitAndNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeepDialogOpen(true);
    await handleSubmitLogic();
  };

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

      const data: any = {
        description: formData.description ? standardizeText(formData.description) : null,
        classification: formData.classification ? standardizeText(formData.classification) : null,
        category: formData.category ? standardizeText(formData.category) : null,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        date: startDate, // Usa "A partir de..." se preenchido, senão data atual
        frequency: frequencyValue,
        installments: frequencyType === "tempo_determinado" && formData.installments 
          ? parseInt(formData.installments) 
          : null,
        documentation_status: formData.documentation_status || "PENDENTE",
      };

      // Remove campos undefined ou string vazia
      Object.keys(data).forEach(key => {
        if (data[key] === "" || data[key] === undefined) {
          data[key] = null;
        }
      });

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      console.error("Erro ao salvar receita:", error);
      // Erro já é tratado no onError da mutation
    }
  };

  const handleEdit = (revenue: any) => {
    setEditingId(revenue.id);
    // Parse da frequency para separar tipo e periodicidade
    const frequency = revenue.frequency || "Única";
    let frequency_type = "";
    let installments = "";
    
    if (frequency.includes("Fixo")) {
      frequency_type = "fixo";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: revenue.description,
          amount: revenue.amount.toString(),
          date: revenue.date,
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Mensal",
          frequency_type: "fixo",
          installments: "",
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: revenue.description,
          amount: revenue.amount.toString(),
          date: revenue.date,
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Anual",
          frequency_type: "fixo",
          installments: "",
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      }
    } else if (frequency.includes("Tempo Determinado")) {
      frequency_type = "tempo_determinado";
      installments = revenue.installments?.toString() || "";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: revenue.description,
          amount: revenue.amount.toString(),
          date: revenue.date,
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Mensal",
          frequency_type: "tempo_determinado",
          installments: installments,
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: revenue.description,
          amount: revenue.amount.toString(),
          date: revenue.date,
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Anual",
          frequency_type: "tempo_determinado",
          installments: installments,
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      }
    } else {
      setFormData({
        description: revenue.description,
        amount: revenue.amount.toString(),
        date: revenue.date,
        classification: revenue.classification || "",
        category: revenue.category || "",
        frequency: frequency,
        frequency_type: "",
        installments: "",
        documentation_status: revenue.documentation_status || "PENDENTE",
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
      classification: "",
      category: "",
      frequency: "",
      frequency_type: "",
      installments: "",
      documentation_status: "PENDENTE",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      date: "",
      classification: "",
      category: "",
      frequency: "",
      frequency_type: "",
      installments: "",
      documentation_status: "PENDENTE",
    });
    setIsDialogOpen(true);
  };

  // Função para preencher formulário com receita existente
  const fillFormFromRevenue = (revenue: any) => {
    const frequency = revenue.frequency || "Única";
    let frequency_type = "";
    let installments = "";
    
    if (frequency.includes("Fixo")) {
      frequency_type = "fixo";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: revenue.description || "",
          amount: revenue.amount?.toString() || "",
          date: new Date().toISOString().split('T')[0], // Data atual
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Mensal",
          frequency_type: "fixo",
          installments: "",
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: revenue.description || "",
          amount: revenue.amount?.toString() || "",
          date: new Date().toISOString().split('T')[0], // Data atual
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Anual",
          frequency_type: "fixo",
          installments: "",
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      }
    } else if (frequency.includes("Tempo Determinado")) {
      frequency_type = "tempo_determinado";
      installments = revenue.installments?.toString() || "";
      if (frequency.includes("Mensal")) {
        setFormData({
          description: revenue.description || "",
          amount: revenue.amount?.toString() || "",
          date: new Date().toISOString().split('T')[0], // Data atual
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Mensal",
          frequency_type: "tempo_determinado",
          installments: installments,
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      } else if (frequency.includes("Anual")) {
        setFormData({
          description: revenue.description || "",
          amount: revenue.amount?.toString() || "",
          date: new Date().toISOString().split('T')[0], // Data atual
          classification: revenue.classification || "",
          category: revenue.category || "",
          frequency: "Anual",
          frequency_type: "tempo_determinado",
          installments: installments,
          documentation_status: revenue.documentation_status || "PENDENTE",
        });
      }
    } else {
      setFormData({
        description: revenue.description || "",
        amount: revenue.amount?.toString() || "",
        date: new Date().toISOString().split('T')[0], // Data atual
        classification: revenue.classification || "",
        category: revenue.category || "",
        frequency: frequency,
        frequency_type: "",
        installments: "",
        documentation_status: revenue.documentation_status || "PENDENTE",
      });
    }
    setIsReuseDialogOpen(false);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleExportPDF = () => {
    if (!sortedRevenues || sortedRevenues.length === 0) {
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
      doc.text("Relatório de Receitas", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Preparar dados da tabela
      const tableData = sortedRevenues.map((revenue) => [
        format(new Date(revenue.date), "dd/MM/yyyy"),
        revenue.description || "",
        revenue.classification || "",
        revenue.category || "",
        revenue.clients?.name || "",
        revenue.properties?.address || "",
        revenue.frequency || "",
        revenue.documentation_status || "",
        formatCurrency(Number(revenue.amount) || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Descrição", "Classificação", "Categoria", "Cliente", "Imóvel", "Periodicidade", "Status Doc.", "Valor"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Receitas_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!sortedRevenues || sortedRevenues.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = sortedRevenues.map((revenue) => ({
      Data: format(new Date(revenue.date), "dd/MM/yyyy"),
      Descrição: revenue.description || "",
      Classificação: revenue.classification || "",
      Categoria: revenue.category || "",
      Cliente: revenue.clients?.name || "",
      Imóvel: revenue.properties?.address || "",
      Periodicidade: revenue.frequency || "",
      "Status Doc.": revenue.documentation_status || "",
      Valor: revenue.amount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receitas");
    
    const fileName = `Receitas_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
    });
  };

  return (
    <div>
      <PageHeader
        title="Receitas"
        description="Gerencie todas as receitas do negócio"
        action={{
          label: "Nova Receita",
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
          className="border-2 border-success/50 rounded-2xl shadow-elegant-lg bg-gradient-card overflow-visible cursor-pointer hover:scale-[1.01] transition-all duration-300"
          onClick={() => setDetailsDialogOpen(true)}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Total de Receitas */}
              <div className="flex items-center justify-between w-full lg:w-auto lg:min-w-[200px]">
                <div className="space-y-2 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-success">
                    TOTAL DE RECEITAS
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-none text-success">
                    {totalCount.toString()}
                  </p>
                </div>
                <div className="relative p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm bg-success/10 text-success flex-shrink-0 ml-2 sm:ml-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Gráfico de Pizza */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-foreground">Origem das Receitas</p>
                </div>
                {revenueByClassification.length > 0 ? (
                  <div className="w-full overflow-visible">
                    <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 250} className="min-h-[200px] md:min-h-[250px]">
                      <PieChart>
                        <Pie
                          data={revenueByClassification}
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
                          {revenueByClassification.map((entry, index) => (
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
                  <div className="flex items-center justify-center min-h-[200px] md:min-h-[250px] text-muted-foreground">
                    <p>Nenhuma receita cadastrada</p>
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
          placeholder="Buscar por descrição, classificação, categoria..."
        />
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "receita" : "receitas"}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">Data</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Descrição</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Classificação</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Categoria</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Cliente</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Imóvel</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Periodicidade</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Status Doc.</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Valor</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRevenues?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <span className="font-medium">Nenhuma receita cadastrada</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedRevenues?.map((revenue, index) => (
                <TableRow 
                  key={revenue.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onDoubleClick={() => handleEdit(revenue)}
                >
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{format(new Date(revenue.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[120px] truncate text-center">{revenue.description}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    {revenue.classification ? (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
                        {revenue.classification}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{revenue.category || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[100px] truncate text-center">{revenue.clients?.name || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground max-w-[120px] truncate border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">{revenue.properties?.address || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[150px] truncate text-center">{revenue.frequency || "-"}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold shadow-sm whitespace-nowrap ${
                      revenue.documentation_status === "PAGO" 
                        ? "bg-success/20 text-success" 
                        : "bg-warning/20 text-warning"
                    }`}>
                      {revenue.documentation_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-success border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {formatCurrency(revenue.amount)}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(revenue)}
                        aria-label="Editar receita"
                        title="Editar receita"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(revenue.id)}
                        aria-label="Excluir receita"
                        title="Excluir receita"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados da receita abaixo." : "Preencha os dados para cadastrar uma nova receita."}
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
              <div className="space-y-2">
                <Label htmlFor="classification">Classificação *</Label>
                <Select value={formData.classification || "none"} onValueChange={(value) => setFormData({ ...formData, classification: value === "none" ? "" : value, property_id: value !== "Recebimento de Aluguel" ? "" : formData.property_id })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="Recebimento de Aluguel">Recebimento de Aluguel</SelectItem>
                    <SelectItem value="Recebimento de Serviços">Recebimento de Serviços</SelectItem>
                    <SelectItem value="Recebimento de Vendas">Recebimento de Vendas</SelectItem>
                    <SelectItem value="Recebimento de Comissões">Recebimento de Comissões</SelectItem>
                    <SelectItem value="Recebimento de Dividendos">Recebimento de Dividendos</SelectItem>
                    <SelectItem value="Recebimento de Arrendamentos">Recebimento de Arrendamentos</SelectItem>
                    <SelectItem value="Outros Recebimentos">Outros Recebimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Pro Labore">Pro Labore</SelectItem>
                    <SelectItem value="Venda de Gado">Venda de Gado</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Acordos">Acordos</SelectItem>
                    <SelectItem value="Comissões">Comissões</SelectItem>
                    <SelectItem value="Dividendos">Dividendos</SelectItem>
                    <SelectItem value="Arrendamentos Rurais">Arrendamentos Rurais</SelectItem>
                    <SelectItem value="Diversos">Diversos</SelectItem>
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
                  <Label htmlFor="documentation_status">Status Documentação</Label>
                  <Select value={formData.documentation_status || "PENDENTE"} onValueChange={(value) => setFormData({ ...formData, documentation_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
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
                  <Label htmlFor="documentation_status">Status Documentação</Label>
                  <Select value={formData.documentation_status || "PENDENTE"} onValueChange={(value) => setFormData({ ...formData, documentation_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              {!editingId && (
                <Button type="button" variant="outline" onClick={handleSubmitAndNew}>
                </Button>
              )}
              <Button type="submit">
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para buscar e reutilizar receitas */}
      <Dialog open={isReuseDialogOpen} onOpenChange={setIsReuseDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buscar Receita para Reutilizar</DialogTitle>
            <DialogDescription>
              Busque uma receita já cadastrada para reutilizar seus dados no novo cadastro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <SmartSearchInput
                value={reuseSearchTerm}
                onChange={setReuseSearchTerm}
                placeholder="Buscar por descrição, categoria, classificação..."
              />
            </div>
            <div className="bg-muted/20 rounded-lg max-h-[400px] overflow-y-auto shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReuseRevenues && filteredReuseRevenues.length > 0 ? (
                    filteredReuseRevenues.map((revenue: any) => (
                      <TableRow key={revenue.id}>
                        <TableCell className="font-medium">{revenue.description || "-"}</TableCell>
                        <TableCell>{revenue.category || "-"}</TableCell>
                        <TableCell>{revenue.classification || "-"}</TableCell>
                        <TableCell className="text-right text-success font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(revenue.amount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fillFormFromRevenue(revenue)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Usar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma receita encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes - Total de Receitas */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes - Total de Receitas</DialogTitle>
            <DialogDescription>
              Lista completa de todas as {totalCount} receitas cadastradas no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Frequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenues?.map((revenue: any) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{revenue.description || "-"}</TableCell>
                    <TableCell>{revenue.category || "-"}</TableCell>
                    <TableCell>{revenue.classification || "-"}</TableCell>
                    <TableCell className="font-bold text-success">
                      {revenue.amount ? formatCurrency(revenue.amount) : "-"}
                    </TableCell>
                    <TableCell>{revenue.date ? format(new Date(revenue.date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                    <TableCell>{revenue.frequency || "Única"}</TableCell>
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

