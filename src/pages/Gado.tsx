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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { StateSearchInput } from "@/components/StateSearchInput";
import { Pencil, Trash2, Download, Package, MapPin, DollarSign, Heart, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput, formatCurrencyInput, parseCurrency } from "@/lib/validations";
import * as XLSX from "xlsx";

export default function Gado() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cattleToDelete, setCattleToDelete] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: "",
    category: "Fêmea",
    origin: "Mato Grosso (MT)",
    quantity: "",
    age_months: "",
    health_status: "Boa",
    location: "",
    purchase_price: "",
    purchase_date: "",
  });

  const { data: cattle } = useQuery({
    queryKey: ["cattle"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cattle")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredCattle, resultCount, totalCount } = useSmartSearch(
    cattle,
    ["category", "origin", "location", "health_status"]
  );

  // Aplicar filtros adicionais
  const filteredByFilters = useMemo(() => {
    if (!filteredCattle) return [];
    let filtered = filteredCattle;
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c: any) => c.category === categoryFilter);
    }
    
    if (healthFilter !== "all") {
      filtered = filtered.filter((c: any) => c.health_status === healthFilter);
    }
    
    return filtered;
  }, [filteredCattle, categoryFilter, healthFilter]);

  const { sortedData: sortedCattle, SortButton } = useTableSort(filteredByFilters);

  // Estatísticas
  const stats = useMemo(() => {
    if (!cattle) return { total: "0", femeas: "0", machos: "0", totalValue: 0, totalQuantity: 0 };
    
    const total = cattle.length;
    const femeas = cattle.filter((c: any) => c.category === "Fêmea").length;
    const machos = cattle.filter((c: any) => c.category === "Macho").length;
    const totalValue = cattle.reduce((sum: number, c: any) => sum + ((c.purchase_price || 0) * (c.quantity || 1)), 0);
    const totalQuantity = cattle.reduce((sum: number, c: any) => sum + (c.quantity || 1), 0);
    
    return { 
      total: total.toString(), 
      femeas: femeas.toString(), 
      machos: machos.toString(), 
      totalValue,
      totalQuantity: totalQuantity.toString()
    };
  }, [cattle]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("cattle").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cattle"] });
      toast({ title: "Gado cadastrado com sucesso!" });
      if (keepDialogOpen) {
        setFormData({
          description: "",
          category: "Fêmea",
          origin: "Mato Grosso (MT)",
          quantity: "",
          age_months: "",
          health_status: "Boa",
          location: "",
          purchase_price: "",
          purchase_date: "",
        });
        setKeepDialogOpen(false);
      } else {
        handleCloseDialog();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar gado",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("cattle").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cattle"] });
      toast({ title: "Gado atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar gado",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cattle").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cattle"] });
      toast({ title: "Gado excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setCattleToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir gado",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setCattleToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setCattleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cattleToDelete) {
      deleteMutation.mutate(cattleToDelete);
    }
  };

  const handleExportPDF = () => {
    if (!cattle || cattle.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há gado cadastrado para exportar.",
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
      doc.text("Relatório de Gado", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = cattle.map((c: any) => [
        c.category || "",
        c.origin || "",
        c.quantity || "",
        c.age_months || "",
        c.health_status || "",
        c.location || "",
        c.purchase_price ? formatCurrency(c.purchase_price) : "",
        c.purchase_date ? format(new Date(c.purchase_date), "dd/MM/yyyy", { locale: ptBR }) : "",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Categoria", "Origem", "Quantidade", "Idade (meses)", "Status Saúde", "Localização", "Preço Compra", "Data Compra"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 7 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Gado_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!cattle || cattle.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há gado cadastrado para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = cattle.map((c: any) => ({
      Categoria: c.category || "",
      Origem: c.origin || "",
      Quantidade: c.quantity || "",
      "Idade (meses)": c.age_months || "",
      "Status de Saúde": c.health_status || "",
      Localização: c.location || "",
      "Preço de Compra": c.purchase_price ? formatCurrency(c.purchase_price) : "",
      "Data de Compra": c.purchase_date ? format(new Date(c.purchase_date), "dd/MM/yyyy", { locale: ptBR }) : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gado");
    XLSX.writeFile(wb, `gado_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${cattle.length} registro(s) exportado(s) com sucesso.`,
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
    const data = {
      description: formData.description ? standardizeText(formData.description) : null,
      category: formData.category ? standardizeText(formData.category) : null,
      location: formData.location ? standardizeText(formData.location) : null,
      origin: formData.origin ? standardizeText(formData.origin) : null,
      health_status: formData.health_status ? standardizeText(formData.health_status) : null,
      quantity: formData.quantity ? parseInt(formData.quantity) : 1,
      age_months: formData.age_months ? parseInt(formData.age_months) : null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      purchase_date: formData.purchase_date || null,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      description: item.description || "",
      category: item.category,
      origin: item.origin,
      quantity: item.quantity.toString(),
      age_months: item.age_months?.toString() || "",
      health_status: item.health_status || "Boa",
      location: item.location || "",
      purchase_price: item.purchase_price?.toString() || "",
      purchase_date: item.purchase_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      description: "",
      category: "Fêmea",
      origin: "Mato Grosso (MT)",
      quantity: "",
      age_months: "",
      health_status: "Boa",
      location: "",
      purchase_price: "",
      purchase_date: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      description: "",
      category: "Fêmea",
      origin: "Mato Grosso (MT)",
      quantity: "",
      age_months: "",
      health_status: "Boa",
      location: "",
      purchase_price: "",
      purchase_date: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Gado"
        description="Gerencie todo o rebanho"
        action={{
          label: "Novo Lote",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total de Registros"
          value={stats.total}
          icon={Package}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Fêmeas"
          value={stats.femeas}
          icon={Package}
          className="bg-gradient-to-br from-pink-500/10 to-pink-500/5"
          onClick={() => {
            setSelectedStat("femeas");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Machos"
          value={stats.machos}
          icon={Package}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5"
          onClick={() => {
            setSelectedStat("machos");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Quantidade Total"
          value={stats.totalQuantity}
          icon={Package}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("quantity");
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
          placeholder="Buscar por categoria, origem, localização, saúde..."
        />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                  <SelectItem value="Macho">Macho</SelectItem>
                </SelectContent>
              </Select>
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Saúde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Boa">Boa</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Ruim">Ruim</SelectItem>
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
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "lote" : "lotes"}
          </div>
        )}
        </CardContent>
      </Card>

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">Descrição</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Categoria</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Origem</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Quantidade</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Idade (meses)</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Saúde</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Localização</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Data Compra</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Preço Compra</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCattle?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">🐄</span>
                    </div>
                    <span className="font-medium">Nenhum lote de gado cadastrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) :
              sortedCattle?.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={`border-b border-border/30 hover:bg-primary/10 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onClick={() => {
                    setSelectedStat(item.id);
                    setDetailsDialogOpen(true);
                  }}
                >
                  {/* ...existing code... */}
                </TableRow>
              ))
            }
          </TableBody>
                {/* Dialog de detalhes do lote de gado - renderizado fora do Table/TableBody */}
                <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Detalhes do Lote</DialogTitle>
                    </DialogHeader>
                    {selectedStat && (() => {
                      const item = sortedCattle?.find((c) => c.id === selectedStat);
                      if (!item) return <div className="text-muted-foreground">Lote não encontrado.</div>;
                      return (
                        <div className="space-y-2">
                          <div><b>Categoria:</b> {item.category}</div>
                          <div><b>Origem:</b> {item.origin}</div>
                          <div><b>Quantidade:</b> {item.quantity}</div>
                          <div><b>Idade (meses):</b> {item.age_months || "-"}</div>
                          <div><b>Saúde:</b> {item.health_status}</div>
                          <div><b>Localização:</b> {item.location || "-"}</div>
                          <div><b>Data Compra:</b> {item.purchase_date ? format(new Date(item.purchase_date), "dd/MM/yyyy") : "-"}</div>
                          <div><b>Preço Compra:</b> {item.purchase_price ? formatCurrency(item.purchase_price) : "-"}</div>
                        </div>
                      );
                    })()}
                  </DialogContent>
                </Dialog>
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
            <DialogTitle>{editingId ? "Editar Lote" : "Novo Lote de Gado"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do lote de gado abaixo." : "Preencha os dados para cadastrar um novo lote de gado."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, description: value }))}
                placeholder="Ex: Lote de Novilhas - Fazenda São João"
                required
              />
              <p className="text-xs text-muted-foreground">Identifique o lote de forma clara</p>
            </div>
            
            <div className="pt-2 border-t">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Detalhes do Lote</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Bezerra">Bezerra</SelectItem>
                    <SelectItem value="Fêmea">Fêmea</SelectItem>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Novilha">Novilha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origem</Label>
                <StateSearchInput
                  value={formData.origin}
                  onChange={(value) => setFormData({ ...formData, origin: value })}
                  placeholder="Buscar estado..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="age_months">Idade (meses)</Label>
                <Input
                  id="age_months"
                  type="number"
                  value={formData.age_months}
                  onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="health_status">Status de Saúde</Label>
                <Select value={formData.health_status} onValueChange={(value) => setFormData({ ...formData, health_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Boa">Boa</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Ruim">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, location: value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Data da Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Preço de Compra</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
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
    </div>
  );
}


