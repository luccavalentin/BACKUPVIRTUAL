import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/layout/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { Building2, Download, CheckCircle2, XCircle, DollarSign, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  formatCEP,
  validateCEP,
  fetchAddressByCEP,
  standardizeText,
  handleStandardizeInput,
  formatCurrencyOnInput,
  parseCurrency,
  formatCurrencyInput,
  formatCurrency,
} from "@/lib/validations";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

export default function Imoveis() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    address: "",
    number: "",
    complement: "",
    city: "",
    cep: "",
    documentation_status: "PENDENTE",
    water_ownership: "PROPRIO",
    energy_ownership: "PROPRIO",
    outstanding_bills: "",
    contract_start: "",
    contract_end: "",
    venal_value: "",
    municipal_registration: "",
    rent_adjustment_type: "",
    rent_adjustment_value: "",
    // Campos para gerar despesa
    create_expense: false,
    parcel_expense: false,
    expense_due_date: "",
    expense_installments: "",
    expense_amount: "",
  });

  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) throw error;
      return data;
    },
  });

  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredProperties,
    resultCount,
    totalCount,
  } = useSmartSearch(properties, [
    "address",
    "city",
    "cep",
    "number",
    "complement",
    "documentation_status",
    "municipal_registration",
  ]);

  // Aplicar filtros adicionais
  const filteredByFilters = useMemo(() => {
    if (!filteredProperties) return [];
    let result = filteredProperties;
    
    if (statusFilter !== "all") {
      result = result.filter((p: any) => p.documentation_status === statusFilter);
    }
    
    if (cityFilter !== "all") {
      result = result.filter((p: any) => {
        const cityName = p.city?.toLowerCase() || "";
        return cityName.includes(cityFilter.toLowerCase());
      });
    }
    
    return result;
  }, [filteredProperties, statusFilter, cityFilter]);

  // Lista de cidades únicas para filtro
  const uniqueCities = useMemo(() => {
    if (!properties) return [];
    const cities = new Set<string>();
    properties.forEach((p: any) => {
      if (p.city) {
        const cityName = p.city.split(" - ")[0]?.trim();
        if (cityName) cities.add(cityName);
      }
    });
    return Array.from(cities).sort();
  }, [properties]);

  const { sortedData: sortedProperties, SortButton } =
    useTableSort(filteredByFilters);

  // Estatísticas
  const stats = useMemo(() => {
    if (!properties) return { 
      total: 0, 
      paid: 0, 
      pending: 0, 
      totalValue: 0,
      withContract: 0 
    };
    
    return {
      total: properties.length,
      paid: properties.filter((p: any) => p.documentation_status === "PAGO").length,
      pending: properties.filter((p: any) => p.documentation_status === "PENDENTE").length,
      totalValue: properties.reduce((sum: number, p: any) => sum + (p.venal_value || 0), 0),
      withContract: properties.filter((p: any) => p.contract_start && p.contract_end).length,
    };
  }, [properties]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: insertedData, error } = await supabase
        .from("properties")
        .insert([data])
        .select();
      if (error) {
        // Se o erro for de coluna não encontrada, tenta novamente sem essas colunas
        if (error.code === "PGRST204") {
          const safeData = { ...data };
          // Remove colunas que podem não existir ainda
          if (error.message?.includes("complement")) delete safeData.complement;
          if (error.message?.includes("number")) delete safeData.number;
          if (error.message?.includes("municipal_registration"))
            delete safeData.municipal_registration;
          if (error.message?.includes("rent_adjustment_percentage"))
            delete safeData.rent_adjustment_percentage;
          if (error.message?.includes("rent_adjustment_text"))
            delete safeData.rent_adjustment_text;
          if (error.message?.includes("rent_adjustment_type"))
            delete safeData.rent_adjustment_type;

          const { data: retryData, error: retryError } = await supabase
            .from("properties")
            .insert([safeData])
            .select();
          if (retryError) throw retryError;
          return retryData[0];
        }
        throw error;
      }
      return insertedData[0];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar imóvel",
        description:
          error.message ||
          "Tente novamente. Execute as migrações: 20251115120003_add_property_fields.sql e 20251115120004_add_number_complement_to_properties.sql",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("properties")
        .update(data)
        .eq("id", id);
      if (error) {
        // Se o erro for de coluna não encontrada, tenta novamente sem essas colunas
        if (error.code === "PGRST204") {
          const safeData = { ...data };
          // Remove colunas que podem não existir ainda
          if (error.message?.includes("complement")) delete safeData.complement;
          if (error.message?.includes("number")) delete safeData.number;
          if (error.message?.includes("municipal_registration"))
            delete safeData.municipal_registration;
          if (error.message?.includes("rent_adjustment_percentage"))
            delete safeData.rent_adjustment_percentage;
          if (error.message?.includes("rent_adjustment_text"))
            delete safeData.rent_adjustment_text;
          if (error.message?.includes("rent_adjustment_type"))
            delete safeData.rent_adjustment_type;

          const { error: retryError } = await supabase
            .from("properties")
            .update(safeData)
            .eq("id", id);
          if (retryError) throw retryError;
          return;
        }
        throw error;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar imóvel",
        description:
          error.message ||
          "Tente novamente. Execute as migrações: 20251115120003_add_property_fields.sql e 20251115120004_add_number_complement_to_properties.sql",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: "Imóvel excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir imóvel",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleExportPDF = () => {
    if (!sortedProperties || sortedProperties.length === 0) {
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
      doc.text("Relatório de Imóveis", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = sortedProperties.map((property: any) => [
        property.address || "",
        property.city || "",
        property.documentation_status || "",
        formatCurrency(Number(property.venal_value) || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Endereço", "Cidade", "Status Documentação", "Valor Venal"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Imoveis_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!sortedProperties || sortedProperties.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = sortedProperties.map((property: any) => ({
      "Endereço": property.address || "",
      "Número": property.number || "",
      "Complemento": property.complement || "",
      "Cidade": property.city || "",
      "CEP": property.cep || "",
      "Status Documentação": property.documentation_status || "",
      "Titularidade Água": property.water_ownership === "TERCEIROS" ? "INQUILINO" : property.water_ownership || "",
      "Titularidade Energia": property.energy_ownership === "TERCEIROS" ? "INQUILINO" : property.energy_ownership || "",
      "Contas em Aberto": property.outstanding_bills || "",
      "Início Contrato": property.contract_start ? format(new Date(property.contract_start), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Fim Contrato": property.contract_end ? format(new Date(property.contract_end), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Inscrição Municipal": property.municipal_registration || "",
      "Valor Venal": property.venal_value || 0,
      "Reajuste Locação": property.rent_adjustment_type ? `${property.rent_adjustment_type}: ${property.rent_adjustment_text || property.rent_adjustment_percentage || ""}` : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Imóveis");
    
    const fileName = `Imoveis_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
    });
  };

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, cep: formatted });

    // Valida e busca endereço quando CEP está completo
    if (validateCEP(formatted)) {
      setIsLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(formatted);

        if (addressData && !addressData.erro) {
          // Monta o endereço completo com logradouro e bairro
          const fullAddress = [
            addressData.logradouro,
            addressData.bairro ? ` - ${addressData.bairro}` : "",
          ]
            .filter(Boolean)
            .join("");

          setFormData((prev) => ({
            ...prev,
            address: fullAddress || prev.address,
            city: addressData.localidade
              ? `${addressData.localidade} - ${addressData.uf}`
              : prev.city,
          }));
          toast({
            title: "Endereço encontrado!",
            description: "Os dados foram preenchidos automaticamente.",
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const generateExpenses = async (propertyId: string) => {
    if (
      !formData.create_expense ||
      !formData.expense_amount ||
      !formData.expense_due_date
    ) {
      return;
    }

    const baseAmount = parseFloat(formData.expense_amount);
    const installments =
      formData.parcel_expense && formData.expense_installments
        ? parseInt(formData.expense_installments)
        : 1;
    const amountPerInstallment = baseAmount / installments;
    const startDate = new Date(formData.expense_due_date);

    const expensesToCreate = [];
    for (let i = 0; i < installments; i++) {
      const dueDate = addMonths(startDate, i);
      expensesToCreate.push({
        description: standardizeText(
          `Documentação Imóvel - ${formData.address || "Imóvel"}${
            installments > 1 ? ` - Parcela ${i + 1}/${installments}` : ""
          }`
        ),
        amount: amountPerInstallment,
        date: format(dueDate, "yyyy-MM-dd"),
        category: "Documentação",
        status: "PENDENTE",
        client_id: null,
      });
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .insert(expensesToCreate);
      if (error) throw error;
      toast({
        title: "Despesas geradas com sucesso!",
        description: `${installments} ${
          installments === 1 ? "despesa" : "despesas"
        } criada${installments > 1 ? "s" : ""} automaticamente.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar despesas",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: any = {
        address: standardizeText(formData.address),
        city: standardizeText(formData.city),
        cep: formData.cep || null,
        venal_value: formData.venal_value
          ? parseCurrency(formData.venal_value)
          : null,
        contract_start: formData.contract_start || null,
        contract_end: formData.contract_end || null,
        documentation_status: formData.documentation_status || null,
        water_ownership:
          formData.water_ownership &&
          ["PROPRIO", "TERCEIROS"].includes(formData.water_ownership)
            ? formData.water_ownership
            : null,
        energy_ownership:
          formData.energy_ownership &&
          ["PROPRIO", "TERCEIROS"].includes(formData.energy_ownership)
            ? formData.energy_ownership
            : null,
        outstanding_bills: formData.outstanding_bills || null,
        municipal_registration: formData.municipal_registration
          ? standardizeText(formData.municipal_registration)
          : null,
        rent_adjustment_percentage: formData.rent_adjustment_type && formData.rent_adjustment_value && formData.rent_adjustment_type !== "text"
          ? parseFloat(formData.rent_adjustment_value)
          : null,
        rent_adjustment_text: formData.rent_adjustment_type === "text" && formData.rent_adjustment_value
          ? formData.rent_adjustment_value
          : null,
        rent_adjustment_type: formData.rent_adjustment_type || null,
      };

      // Adiciona number e complement
      data.number = formData.number ? standardizeText(formData.number) : null;
      data.complement = formData.complement
        ? standardizeText(formData.complement)
        : null;

      // Remove campos de despesa do objeto de dados do imóvel
      delete (data as any).create_expense;
      delete (data as any).parcel_expense;
      delete (data as any).expense_due_date;
      delete (data as any).expense_installments;
      delete (data as any).expense_amount;

      let propertyId: string;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        propertyId = editingId;
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        toast({ title: "Imóvel atualizado com sucesso!" });
      } else {
        const insertedProperty = await createMutation.mutateAsync(data);
        propertyId = insertedProperty.id;
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        toast({ title: "Imóvel cadastrado com sucesso!" });
      }

      // Gerar despesas se necessário
      if (
        formData.documentation_status === "PENDENTE" &&
        formData.create_expense
      ) {
        await generateExpenses(propertyId);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
      }

      handleCloseDialog();
    } catch (error: any) {
      // Erro já é tratado nas mutations, mas garantimos que não quebra a aplicação
      console.error("Erro ao salvar imóvel:", error);
    }
  };

  const handleEdit = (property: any) => {
    setEditingId(property.id);
    setFormData({
      address: property.address || "",
      number: property.number || "",
      complement: property.complement || "",
      city: property.city || "",
      cep: property.cep || "",
      documentation_status: property.documentation_status || "PENDENTE",
      water_ownership: property.water_ownership || "PROPRIO",
      energy_ownership: property.energy_ownership || "PROPRIO",
      outstanding_bills: property.outstanding_bills || "",
      contract_start: property.contract_start || "",
      contract_end: property.contract_end || "",
      venal_value: property.venal_value
        ? formatCurrencyInput(property.venal_value)
        : "",
      municipal_registration: property.municipal_registration || "",
      rent_adjustment_type: property.rent_adjustment_type || "",
      rent_adjustment_value: property.rent_adjustment_type === "text"
        ? property.rent_adjustment_text || ""
        : property.rent_adjustment_percentage?.toString() || "",
      create_expense: false,
      parcel_expense: false,
      expense_due_date: "",
      expense_installments: "",
      expense_amount: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      address: "",
      number: "",
      complement: "",
      city: "",
      cep: "",
      documentation_status: "PENDENTE",
      water_ownership: "PROPRIO",
      energy_ownership: "PROPRIO",
      outstanding_bills: "",
      contract_start: "",
      contract_end: "",
      venal_value: "",
      municipal_registration: "",
      rent_adjustment_type: "",
      rent_adjustment_value: "",
      create_expense: false,
      parcel_expense: false,
      expense_due_date: "",
      expense_installments: "",
      expense_amount: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      address: "",
      number: "",
      complement: "",
      city: "",
      cep: "",
      documentation_status: "PENDENTE",
      water_ownership: "PROPRIO",
      energy_ownership: "PROPRIO",
      outstanding_bills: "",
      contract_start: "",
      contract_end: "",
      venal_value: "",
      municipal_registration: "",
      rent_adjustment_type: "",
      rent_adjustment_value: "",
      create_expense: false,
      parcel_expense: false,
      expense_due_date: "",
      expense_installments: "",
      expense_amount: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Imóveis"
        description="Gerencie todos os imóveis e propriedades"
        action={{
          label: "Novo Imóvel",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total de Imóveis"
          value={stats.total}
          icon={Building2}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Documentação Paga"
          value={stats.paid}
          icon={CheckCircle2}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("paid");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Documentação Pendente"
          value={stats.pending}
          icon={XCircle}
          className="bg-gradient-to-br from-destructive/10 to-destructive/5"
          onClick={() => {
            setSelectedStat("pending");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Valor Total Venal"
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
                placeholder="Buscar por endereço, cidade, CEP, número, inscrição municipal..."
        />
          </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="PAGO">PAGO</SelectItem>
                  <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Cidades</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
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
          {(searchTerm || statusFilter !== "all" || cityFilter !== "all") && (
            <div className="mt-3 text-sm text-muted-foreground">
              Mostrando {sortedProperties?.length || 0} de {totalCount} {totalCount === 1 ? "imóvel" : "imóveis"}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="address">Endereço</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="city">Cidade</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="documentation_status">
                  Status Doc.
                </SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="water_ownership">Água</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="energy_ownership">Energia</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Vigência Contrato</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">Inscrição Municipal</TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="venal_value">Valor Venal</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProperties?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <span className="font-medium">Nenhum imóvel cadastrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedProperties?.map((property, index) => (
                <TableRow
                  key={property.id}
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted/5"
                  }`}
                  onDoubleClick={() => handleEdit(property)}
                >
                  <TableCell className="font-semibold text-foreground max-w-[150px] border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <div className="flex flex-col items-center">
                      <span className="truncate">{property.address}</span>
                      {(property.number || property.complement) && (
                        <span className="text-xs text-foreground/70 truncate font-medium">
                          {[property.number, property.complement]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[100px] truncate text-center">{property.city}</TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    {property.documentation_status === "PAGO" ? (
                      <Badge className="bg-success/20 text-success hover:bg-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        PAGO
                      </Badge>
                    ) : property.documentation_status === "PENDENTE" ? (
                      <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        PENDENTE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {property.documentation_status || "-"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {property.water_ownership === "TERCEIROS"
                      ? "INQUILINO"
                      : property.water_ownership || "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {property.energy_ownership === "TERCEIROS"
                      ? "INQUILINO"
                      : property.energy_ownership || "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground text-xs border-r border-border/30 px-1.5 sm:px-2 whitespace-nowrap text-center">
                    {property.contract_start && property.contract_end
                      ? `${format(
                          new Date(property.contract_start),
                          "dd/MM/yy"
                        )} - ${format(
                          new Date(property.contract_end),
                          "dd/MM/yy"
                        )}`
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[100px] truncate text-center">{property.municipal_registration || "-"}</TableCell>
                  <TableCell className="text-center font-bold text-success border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {property.venal_value
                      ? formatCurrency(property.venal_value)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <IconButton
                        icon={Pencil}
                        onClick={() => handleEdit(property)}
                        variant="edit"
                      />
                      <IconButton
                        icon={Trash2}
                        onClick={() => handleDelete(property.id)}
                        variant="delete"
                      />
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
            <DialogTitle>
              {editingId ? "Editar Imóvel" : "Novo Imóvel"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Atualize as informações do imóvel abaixo."
                : "Preencha os dados do novo imóvel abaixo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCEPChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    disabled={isLoadingCEP}
                    className={
                      validateCEP(formData.cep) ? "border-green-500" : ""
                    }
                  />
                  {isLoadingCEP && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {formData.cep &&
                  !validateCEP(formData.cep) &&
                  formData.cep.length >= 5 && (
                    <p className="text-xs text-muted-foreground">
                      Digite um CEP válido (8 dígitos)
                    </p>
                  )}
              </div>
              <div className="space-y-2.5 col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  onBlur={(e) =>
                    handleStandardizeInput(e.target.value, (value) =>
                      setFormData({ ...formData, address: value })
                    )
                  }
                  placeholder="Rua, Avenida, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  onBlur={(e) =>
                    handleStandardizeInput(e.target.value, (value) =>
                      setFormData({ ...formData, number: value })
                    )
                  }
                  placeholder="123"
                />
              </div>
              <div className="space-y-2.5 col-span-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) =>
                    setFormData({ ...formData, complement: e.target.value })
                  }
                  onBlur={(e) =>
                    handleStandardizeInput(e.target.value, (value) =>
                      setFormData({ ...formData, complement: value })
                    )
                  }
                  placeholder="Apto, Bloco, etc."
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                onBlur={(e) =>
                  handleStandardizeInput(e.target.value, (value) =>
                    setFormData({ ...formData, city: value })
                  )
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="documentation_status">
                  Status Documentação
                </Label>
                <Select
                  value={formData.documentation_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentation_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="PAGO">PAGO</SelectItem>
                    <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="water_ownership">Titularidade Água</Label>
                <Select
                  value={formData.water_ownership}
                  onValueChange={(value) =>
                    setFormData({ ...formData, water_ownership: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="PROPRIO">PRÓPRIO</SelectItem>
                    <SelectItem value="TERCEIROS">INQUILINO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="energy_ownership">Titularidade Energia</Label>
                <Select
                  value={formData.energy_ownership}
                  onValueChange={(value) =>
                    setFormData({ ...formData, energy_ownership: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="PROPRIO">PRÓPRIO</SelectItem>
                    <SelectItem value="TERCEIROS">INQUILINO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="outstanding_bills">Contas em Aberto</Label>
              <Textarea
                id="outstanding_bills"
                value={formData.outstanding_bills}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    outstanding_bills: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="contract_start">
                  Início Contrato (Vigência)
                </Label>
                <Input
                  id="contract_start"
                  type="date"
                  value={formData.contract_start}
                  onChange={(e) =>
                    setFormData({ ...formData, contract_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="contract_end">Fim Contrato (Vigência)</Label>
                <Input
                  id="contract_end"
                  type="date"
                  value={formData.contract_end}
                  onChange={(e) =>
                    setFormData({ ...formData, contract_end: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="rent_adjustment_type">
                  Reajuste Locação
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={formData.rent_adjustment_type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        rent_adjustment_type: value,
                        rent_adjustment_value: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="currency">R$</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.rent_adjustment_type && (
                    <Input
                      id="rent_adjustment_value"
                      type={formData.rent_adjustment_type === "text" ? "text" : "number"}
                      step={formData.rent_adjustment_type === "percent" ? "0.01" : "0.01"}
                      value={formData.rent_adjustment_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rent_adjustment_value: e.target.value,
                        })
                      }
                      placeholder={
                        formData.rent_adjustment_type === "percent"
                          ? "Ex: 5.5"
                          : formData.rent_adjustment_type === "currency"
                          ? "Ex: 100.00"
                          : "Digite o texto"
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-3">
                <Label htmlFor="municipal_registration">
                  Inscrição Municipal
                </Label>
                <Input
                  id="municipal_registration"
                  value={formData.municipal_registration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      municipal_registration: e.target.value,
                    })
                  }
                  onBlur={(e) =>
                    handleStandardizeInput(e.target.value, (value) =>
                      setFormData({
                        ...formData,
                        municipal_registration: value,
                      })
                    )
                  }
                  placeholder="Número da inscrição municipal"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="venal_value">Valor Venal</Label>
                <Input
                  id="venal_value"
                  type="text"
                  value={formData.venal_value}
                  onChange={(e) => {
                    // Permite edição livre do valor formatado
                    // A formatação será corrigida no onBlur
                    setFormData({ ...formData, venal_value: e.target.value });
                  }}
                  onBlur={(e) => {
                    // Garante formatação correta ao sair do campo
                    const parsed = parseCurrency(e.target.value);
                    if (parsed !== null) {
                      const formatted = formatCurrencyInput(parsed);
                      setFormData({ ...formData, venal_value: formatted });
                    } else if (e.target.value === "") {
                      setFormData({ ...formData, venal_value: "" });
                    }
                  }}
                  placeholder="0,00"
                />
              </div>
            </div>

            {formData.documentation_status === "PENDENTE" && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create_expense"
                    checked={formData.create_expense}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        create_expense: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="create_expense"
                    className="font-semibold cursor-pointer"
                  >
                    Cadastrar Despesa de Pagamento
                  </Label>
                </div>

                {formData.create_expense && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="expense_amount">
                          Valor da Despesa *
                        </Label>
                        <Input
                          id="expense_amount"
                          type="number"
                          step="0.01"
                          value={formData.expense_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expense_amount: e.target.value,
                            })
                          }
                          placeholder="0,00"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="expense_due_date">
                          Data de Vencimento *
                        </Label>
                        <Input
                          id="expense_due_date"
                          type="date"
                          value={formData.expense_due_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expense_due_date: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parcel_expense"
                        checked={formData.parcel_expense}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            parcel_expense: checked === true,
                            expense_installments:
                              checked === true
                                ? formData.expense_installments
                                : "",
                          })
                        }
                      />
                      <Label
                        htmlFor="parcel_expense"
                        className="cursor-pointer"
                      >
                        Parcelar Pagamento
                      </Label>
                    </div>

                    {formData.parcel_expense && (
                      <div className="space-y-3">
                        <Label htmlFor="expense_installments">
                          Quantidade de Parcelas *
                        </Label>
                        <Input
                          id="expense_installments"
                          type="number"
                          min="1"
                          value={formData.expense_installments}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expense_installments: e.target.value,
                            })
                          }
                          placeholder="Ex: 3"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          As despesas serão geradas automaticamente com
                          vencimentos mensais a partir da data informada.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                size="lg"
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg">
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
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita e pode afetar registros relacionados.
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

      {/* Dialog de Detalhes das Estatísticas */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStat === "total" && "Detalhes - Total de Imóveis"}
              {selectedStat === "paid" && "Detalhes - Documentação Paga"}
              {selectedStat === "pending" && "Detalhes - Documentação Pendente"}
              {selectedStat === "value" && "Detalhes - Valor Total Venal"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todos os ${stats.total} imóveis cadastrados no sistema.`}
              {selectedStat === "paid" && `Lista dos ${stats.paid} imóveis com documentação paga.`}
              {selectedStat === "pending" && `Lista dos ${stats.pending} imóveis com documentação pendente.`}
              {selectedStat === "value" && `Detalhamento do valor total venal de R$ ${formatCurrency(stats.totalValue)}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStat === "total" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Total de imóveis cadastrados: <strong className="text-foreground">{stats.total}</strong>
                </p>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valor Venal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties?.map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.address || "-"}</TableCell>
                          <TableCell>{property.city || "-"}</TableCell>
                          <TableCell>
                            {property.documentation_status === "PAGO" ? (
                              <Badge className="bg-success/20 text-success">PAGO</Badge>
                            ) : (
                              <Badge className="bg-destructive/20 text-destructive">PENDENTE</Badge>
                            )}
                          </TableCell>
                          <TableCell>{property.venal_value ? formatCurrency(property.venal_value) : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {selectedStat === "paid" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Imóveis com documentação paga: <strong className="text-foreground">{stats.paid}</strong>
                </p>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Valor Venal</TableHead>
                        <TableHead>Inscrição Municipal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties?.filter((p: any) => p.documentation_status === "PAGO").map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.address || "-"}</TableCell>
                          <TableCell>{property.city || "-"}</TableCell>
                          <TableCell>{property.venal_value ? formatCurrency(property.venal_value) : "-"}</TableCell>
                          <TableCell>{property.municipal_registration || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {selectedStat === "pending" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Imóveis com documentação pendente: <strong className="text-foreground">{stats.pending}</strong>
                </p>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Valor Venal</TableHead>
                        <TableHead>Inscrição Municipal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties?.filter((p: any) => p.documentation_status === "PENDENTE").map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.address || "-"}</TableCell>
                          <TableCell>{property.city || "-"}</TableCell>
                          <TableCell>{property.venal_value ? formatCurrency(property.venal_value) : "-"}</TableCell>
                          <TableCell>{property.municipal_registration || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                      <p className="text-sm text-muted-foreground mb-2">Imóveis com Valor</p>
                      <p className="text-2xl font-bold">{properties?.filter((p: any) => p.venal_value).length || 0}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Valor Venal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties?.filter((p: any) => p.venal_value).sort((a: any, b: any) => (b.venal_value || 0) - (a.venal_value || 0)).map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.address || "-"}</TableCell>
                          <TableCell>{property.city || "-"}</TableCell>
                          <TableCell className="font-bold text-success">{formatCurrency(property.venal_value)}</TableCell>
                          <TableCell>
                            {property.documentation_status === "PAGO" ? (
                              <Badge className="bg-success/20 text-success">PAGO</Badge>
                            ) : (
                              <Badge className="bg-destructive/20 text-destructive">PENDENTE</Badge>
                            )}
                          </TableCell>
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
    </div>
  );
}

