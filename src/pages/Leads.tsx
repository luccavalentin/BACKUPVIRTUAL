import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { StatsCard } from "@/components/layout/StatsCard";
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
import { Pencil, Trash2, Target, Download, TrendingUp, DollarSign, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput, formatCurrencyInput, parseCurrency } from "@/lib/validations";
import * as XLSX from "xlsx";

export default function Leads() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    contract_value: "",
    status: "Inicial",
    notes: "",
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredLeads, resultCount, totalCount } = useSmartSearch(
    leads,
    ["name", "status", "notes"]
  );

  // Aplicar filtro por status
  const filteredByStatus = useMemo(() => {
    if (!filteredLeads) return [];
    if (statusFilter === "all") return filteredLeads;
    return filteredLeads.filter((lead: any) => lead.status === statusFilter);
  }, [filteredLeads, statusFilter]);

  const { sortedData: sortedLeads, SortButton } = useTableSort(filteredByStatus);

  // Estatísticas
  const stats = useMemo(() => {
    if (!leads) return { total: "0", inicial: "0", negociacao: "0", fechado: "0", perdido: "0", totalValue: 0 };
    
    const total = leads.length;
    const inicial = leads.filter((l: any) => l.status === "Inicial").length;
    const negociacao = leads.filter((l: any) => l.status === "Negociação").length;
    const fechado = leads.filter((l: any) => l.status === "Fechado").length;
    const perdido = leads.filter((l: any) => l.status === "Perdido").length;
    const totalValue = leads.reduce((sum: number, l: any) => sum + (l.contract_value || 0), 0);
    
    return { total: total.toString(), inicial: inicial.toString(), negociacao: negociacao.toString(), fechado: fechado.toString(), perdido: perdido.toString(), totalValue };
  }, [leads]);

  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("leads").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead cadastrado com sucesso!" });
      if (keepDialogOpen) {
        setFormData({
          name: "",
          start_date: "",
          end_date: "",
          contract_value: "",
          status: "Inicial",
          notes: "",
        });
        setKeepDialogOpen(false);
      } else {
      handleCloseDialog();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar lead",
        description: error.message || "Ocorreu um erro ao cadastrar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("leads").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar lead",
        description: error.message || "Ocorreu um erro ao atualizar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir lead",
        description: error.message || "Ocorreu um erro ao excluir o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete);
    }
  };

  const handleExportPDF = () => {
    if (!leads || leads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads cadastrados para exportar.",
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
      doc.text("Relatório de Leads", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = leads.map((lead: any) => [
        lead.name || "",
        lead.status || "",
        lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "",
        lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "",
        lead.contract_value ? formatCurrency(lead.contract_value) : "",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Nome", "Status", "Data Início", "Data Fim", "Valor Contrato"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Leads_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!leads || leads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads cadastrados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = leads.map((lead: any) => ({
      Nome: lead.name || "",
      Status: lead.status || "",
      "Data Início": lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Data Fim": lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Valor Contrato": lead.contract_value ? formatCurrency(lead.contract_value) : "",
      Observações: lead.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${leads.length} lead(s) exportado(s) com sucesso.`,
    });
  };

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
      const mappedData: any = {
        name: formData.name ? standardizeText(formData.name) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
        status: formData.status || null,
        notes: formData.notes || null,
      };

      // Remove campos undefined ou string vazia
      Object.keys(mappedData).forEach(key => {
        if (mappedData[key] === "" || mappedData[key] === undefined) {
          mappedData[key] = null;
        }
      });

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: mappedData });
      } else {
        await createMutation.mutateAsync(mappedData);
      }
    } catch (error: any) {
      console.error("Erro ao salvar lead:", error);
      // Erro já é tratado no onError da mutation
    }
  };

  const handleEdit = (lead: any) => {
    setEditingId(lead.id);
    setFormData({
      name: lead.name,
      start_date: lead.start_date,
      end_date: lead.end_date,
      contract_value: lead.contract_value?.toString() || "",
      status: lead.status || "Inicial",
      notes: lead.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      contract_value: "",
      status: "Inicial",
      notes: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      contract_value: "",
      status: "Inicial",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCadastrarLeads = async () => {
    const leads = [
      "Via Campos",
      "Intercambio",
      "Silvio Felix",
      "Ind. Du Frasson",
      "Eduardo - Alfa",
      "Acordo Coronel",
      "Empresa Sul",
      "Daniel Bertanha",
      "Moveis Cassimiro",
      "Contratos Bancos",
      "Bids, Leilões Esc.",
      "Licitações",
      "Maqtiva",
      "Venda Terreno Pita",
      "Empresa De Americana",
      "Ingred",
      "2 Acoes De Cobranca Intercambio",
      "Contratos Pj Intercambio"
    ];

    let sucesso = 0;
    let erros = 0;

    for (const nome of leads) {
      const nomePadronizado = standardizeText(nome);
      
      try {
        // Verifica se já existe um lead com o mesmo nome (case-insensitive)
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .ilike("name", nomePadronizado)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`⚠️ Lead ${nomePadronizado} já existe, pulando...`);
          continue;
        }

        const { error } = await supabase
          .from("leads")
          .insert([{
            name: nomePadronizado,
            status: "Inicial"
          }]);

        if (error) {
          console.log(`❌ Erro ao cadastrar ${nome}: ${error.message}`);
          erros++;
        } else {
          console.log(`✅ Lead ${nomePadronizado} cadastrado com sucesso`);
          sucesso++;
        }
      } catch (error: any) {
        console.log(`❌ Erro ao cadastrar ${nome}: ${error.message || error}`);
        erros++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    await queryClient.invalidateQueries({ queryKey: ["leads"] });
    
    toast({
      title: "Cadastro concluído",
      description: `${sucesso} lead(s) cadastrado(s) com sucesso. ${erros} erro(s).`,
      variant: erros > 0 ? "destructive" : "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Inicial":
        return "bg-muted/10 text-muted-foreground";
      case "Negociação":
        return "bg-warning/10 text-warning";
      case "Fechado":
        return "bg-success/10 text-success";
      case "Perdido":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Gerencie oportunidades de negócio"
        action={{
          label: "Novo Lead",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total de Leads"
          value={stats.total}
          icon={Target}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Inicial"
          value={stats.inicial}
          icon={Clock}
          className="bg-gradient-to-br from-muted/10 to-muted/5"
          onClick={() => {
            setSelectedStat("inicial");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Negociação"
          value={stats.negociacao}
          icon={TrendingUp}
          className="bg-gradient-to-br from-warning/10 to-warning/5"
          onClick={() => {
            setSelectedStat("negociacao");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Fechado"
          value={stats.fechado}
          icon={CheckCircle2}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("fechado");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
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
                placeholder="Buscar por nome, status, observações..."
        />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
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
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "lead" : "leads"}
          </div>
        )}
        </CardContent>
      </Card>

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center"><SortButton column="name">Nome</SortButton></TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center"><SortButton column="start_date">Data Início</SortButton></TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center"><SortButton column="end_date">Data Fim</SortButton></TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center"><SortButton column="status">Status</SortButton></TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center"><SortButton column="contract_value">Valor Contrato</SortButton></TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <span className="font-medium">Nenhum lead cadastrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedLeads?.map((lead, index) => (
                <TableRow 
                  key={lead.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onDoubleClick={() => handleEdit(lead)}
                >
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[150px] truncate text-center">{lead.name}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <Badge 
                      variant="outline"
                      className={`${
                        lead.status === "Inicial" ? "bg-muted/20 text-muted-foreground border-muted" :
                        lead.status === "Negociação" ? "bg-warning/20 text-warning border-warning/30" :
                        lead.status === "Fechado" ? "bg-success/20 text-success border-success/30" :
                        lead.status === "Perdido" ? "bg-destructive/20 text-destructive border-destructive/30" :
                        "bg-muted/20 text-muted-foreground border-muted"
                      }`}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-success border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {lead.contract_value ? formatCurrency(lead.contract_value) : "-"}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(lead)}
                              className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar lead</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                              onClick={() => handleDelete(lead.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir lead</p>
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
            <DialogTitle>{editingId ? "Editar Lead" : "Novo Lead"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do lead abaixo." : "Preencha os dados para cadastrar um novo lead."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, name: value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Fim</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_value">Valor Contrato</Label>
                <Input
                  id="contract_value"
                  type="text"
                  value={formData.contract_value}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d,.-]/g, "");
                    setFormData({ ...formData, contract_value: value });
                  }}
                  onBlur={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    if (parsed !== null) {
                      setFormData({ ...formData, contract_value: formatCurrencyInput(parsed) });
                    }
                  }}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              {!editingId && (
                <Button type="button" variant="outline" onClick={handleSubmitAndNew}>
                  Cadastrar Novo
                </Button>
              )}
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
              {selectedStat === "total" && "Detalhes - Total de Leads"}
              {selectedStat === "inicial" && "Detalhes - Leads Iniciais"}
              {selectedStat === "negociacao" && "Detalhes - Leads em Negociação"}
              {selectedStat === "fechado" && "Detalhes - Leads Fechados"}
              {selectedStat === "value" && "Detalhes - Valor Total"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todos os ${stats.total} leads cadastrados.`}
              {selectedStat === "inicial" && `Lista dos ${stats.inicial} leads com status inicial.`}
              {selectedStat === "negociacao" && `Lista dos ${stats.negociacao} leads em negociação.`}
              {selectedStat === "fechado" && `Lista dos ${stats.fechado} leads fechados.`}
              {selectedStat === "value" && `Detalhamento do valor total de R$ ${formatCurrency(stats.totalValue)}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStat === "total" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Valor Contrato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.contract_value ? formatCurrency(lead.contract_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "inicial" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Valor Contrato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.filter((l: any) => l.status === "Inicial").map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                        <TableCell>{lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.contract_value ? formatCurrency(lead.contract_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "negociacao" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Valor Contrato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.filter((l: any) => l.status === "Negociação").map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                        <TableCell>{lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell className="font-bold text-warning">{lead.contract_value ? formatCurrency(lead.contract_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "fechado" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Valor Contrato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.filter((l: any) => l.status === "Fechado").map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                        <TableCell>{lead.start_date ? format(new Date(lead.start_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell className="font-bold text-success">{lead.contract_value ? formatCurrency(lead.contract_value) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                      <p className="text-sm text-muted-foreground mb-2">Leads com Valor</p>
                      <p className="text-2xl font-bold">{leads?.filter((l: any) => l.contract_value).length || 0}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valor Contrato</TableHead>
                        <TableHead>Data Fim</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads?.filter((l: any) => l.contract_value).sort((a: any, b: any) => (b.contract_value || 0) - (a.contract_value || 0)).map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-success">{formatCurrency(lead.contract_value)}</TableCell>
                          <TableCell>{lead.end_date ? format(new Date(lead.end_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita e pode afetar registros relacionados.
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


