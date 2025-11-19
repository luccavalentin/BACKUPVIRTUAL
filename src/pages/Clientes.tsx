import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Users, Download, Mail, Building2, User, FileText, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StatsCard } from "@/components/layout/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  standardizeText, 
  handleStandardizeInput,
  formatCPF,
  formatCNPJ,
  validateCPF,
  validateCNPJ,
  formatPhone,
  validatePhone
} from "@/lib/validations";
import * as XLSX from "xlsx";

const TYPE_MAP_TO_DB = {
  "Pessoa Física": "person",
  "Pessoa Jurídica": "company",
} as const;

const TYPE_MAP_FROM_DB = {
  person: "Pessoa Física",
  company: "Pessoa Jurídica",
} as const;

export default function Clientes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf_cnpj: "",
    type: "Pessoa Física",
    address: "",
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    cpf_cnpj?: string;
    phone?: string;
    email?: string;
  }>({});

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData: filteredClients, resultCount, totalCount } = useSmartSearch(
    clients,
    ["name", "cpf_cnpj", "phone", "address", "email", "notes"]
  );

  // Aplicar filtro por tipo
  const filteredByType = useMemo(() => {
    if (!filteredClients) return [];
    if (typeFilter === "all") return filteredClients;
    
    const dbType = TYPE_MAP_TO_DB[typeFilter as keyof typeof TYPE_MAP_TO_DB];
    return filteredClients.filter((client: any) => client.type === dbType);
  }, [filteredClients, typeFilter]);

  const { sortedData: sortedClients, SortButton } = useTableSort(filteredByType);

  // Estatísticas
  const stats = useMemo(() => {
    if (!clients) return { 
      total: 0, 
      person: 0, 
      company: 0, 
      withDocument: 0, 
      withEmail: 0,
      withPhone: 0 
    };
    
    return {
      total: clients.length,
      person: clients.filter((c: any) => c.type === "person").length,
      company: clients.filter((c: any) => c.type === "company").length,
      withDocument: clients.filter((c: any) => c.cpf_cnpj).length,
      withEmail: clients.filter((c: any) => c.email).length,
      withPhone: clients.filter((c: any) => c.phone).length,
    };
  }, [clients]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("clients").insert([data]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      // toast({ title: "Cliente cadastrado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      // Se for erro de duplicidade, não exibe toast
      if (error?.message?.toLowerCase().includes("duplicate") || error?.message?.toLowerCase().includes("duplicidade") || error?.message?.toLowerCase().includes("already exists") || error?.code === "23505") {
        // Silencia erro de duplicidade
        return;
      }
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("clients").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Ocorreu um erro ao atualizar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente excluído com sucesso!" });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validações
    const errors: { cpf_cnpj?: string; phone?: string; email?: string } = {};
    
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }
  
  if (formData.cpf_cnpj && formData.cpf_cnpj.trim()) {
    const cleanCPF_CNPJ = formData.cpf_cnpj.replace(/[^\d]/g, "");
    if (formData.type === "Pessoa Física") {
      if (cleanCPF_CNPJ.length === 11 && !validateCPF(formData.cpf_cnpj)) {
        errors.cpf_cnpj = "CPF inválido";
      } else if (cleanCPF_CNPJ.length !== 11 && cleanCPF_CNPJ.length > 0) {
        errors.cpf_cnpj = "CPF deve ter 11 dígitos";
      }
    } else {
      if (cleanCPF_CNPJ.length === 14 && !validateCNPJ(formData.cpf_cnpj)) {
        errors.cpf_cnpj = "CNPJ inválido";
      } else if (cleanCPF_CNPJ.length !== 14 && cleanCPF_CNPJ.length > 0) {
        errors.cpf_cnpj = "CNPJ deve ter 14 dígitos";
      }
    }
  }
  
  if (formData.phone && formData.phone.trim() && !validatePhone(formData.phone)) {
    errors.phone = "Telefone inválido (deve ter 10 ou 11 dígitos)";
  }

    if (formData.email && formData.email.trim() && !validateEmail(formData.email)) {
      errors.email = "Email inválido";
    }
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    toast({
      title: "Erro de validação",
      description: "Corrija os campos destacados antes de continuar.",
      variant: "destructive",
    });
    return;
  }
  
  setValidationErrors({});
  
  try {
    // Limpar campos vazios e converter para null
    const mappedData: any = {
        name: standardizeText(formData.name),
      phone: formData.phone || null,
        email: formData.email ? formData.email.toLowerCase().trim() : null,
      cpf_cnpj: formData.cpf_cnpj || null,
      address: formData.address ? standardizeText(formData.address) : null,
        notes: formData.notes ? standardizeText(formData.notes) : null,
      type: TYPE_MAP_TO_DB[formData.type as keyof typeof TYPE_MAP_TO_DB] ?? 'person',
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
    console.error("Erro ao salvar cliente:", error);
    // Erro já é tratado no onError da mutation
  }
};

const handleEdit = (client: any) => {
  setEditingId(client.id);
  
  // Formata CPF/CNPJ e telefone ao carregar
  let formattedCPF_CNPJ = client.cpf_cnpj || "";
  if (formattedCPF_CNPJ) {
    const cleanValue = formattedCPF_CNPJ.replace(/[^\d]/g, "");
    const clientType = TYPE_MAP_FROM_DB[(client.type as keyof typeof TYPE_MAP_FROM_DB) || 'person'] || "Pessoa Física";
    if (clientType === "Pessoa Física" && cleanValue.length === 11) {
      formattedCPF_CNPJ = formatCPF(cleanValue);
    } else if (clientType === "Pessoa Jurídica" && cleanValue.length === 14) {
      formattedCPF_CNPJ = formatCNPJ(cleanValue);
    }
  }
  
  let formattedPhone = client.phone || "";
  if (formattedPhone) {
    const cleanValue = formattedPhone.replace(/[^\d]/g, "");
    if (cleanValue.length === 10 || cleanValue.length === 11) {
      formattedPhone = formatPhone(cleanValue);
    }
  }
  
  setFormData({
      name: client.name || "",
    phone: formattedPhone,
      email: client.email || "",
    cpf_cnpj: formattedCPF_CNPJ,
    type: TYPE_MAP_FROM_DB[(client.type as keyof typeof TYPE_MAP_FROM_DB) || 'person'] || "Pessoa Física",
    address: client.address || "",
      notes: client.notes || "",
  });
  setValidationErrors({});
  setIsDialogOpen(true);
};

  const handleDelete = (id: string) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      cpf_cnpj: "",
      type: "Pessoa Física",
      address: "",
      notes: "",
    });
    setValidationErrors({});
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      cpf_cnpj: "",
      type: "Pessoa Física",
      address: "",
      notes: "",
    });
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleExportPDF = () => {
    if (!sortedClients || sortedClients.length === 0) {
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
      doc.text("Relatório de Clientes", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = sortedClients.map((client: any) => [
        client.name || "",
        TYPE_MAP_FROM_DB[client.type as keyof typeof TYPE_MAP_FROM_DB] || "",
        client.cpf_cnpj || "",
        client.phone || "",
        client.email || "",
        client.address || "",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Nome", "Tipo", "CPF/CNPJ", "Telefone", "Email", "Endereço"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Clientes_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!sortedClients || sortedClients.length === 0) {
        toast({
        title: "Erro",
        description: "Não há dados para exportar.",
        variant: "destructive",
        });
        return;
      }

    const data = sortedClients.map((client: any) => ({
      "Nome": client.name || "",
      "Tipo": TYPE_MAP_FROM_DB[client.type as keyof typeof TYPE_MAP_FROM_DB] || "",
      "CPF/CNPJ": client.cpf_cnpj || "",
      "Telefone": client.phone || "",
      "Email": client.email || "",
      "Endereço": client.address || "",
      "Anotações": client.notes || "",
      "Data de Criação": format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR }),
      "Última Atualização": format(new Date(client.updated_at), "dd/MM/yyyy", { locale: ptBR }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    
    const fileName = `Clientes_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

        toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
      });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Clientes"
        description="Gerencie todos os clientes e fornecedores do sistema"
        action={{
          label: "Novo Cliente",
          onClick: handleNewItem,
        }}
      />

      <QuickActions />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total de Clientes"
          value={stats.total}
          icon={Users}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("total");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Pessoa Física"
          value={stats.person}
          icon={User}
          className="bg-gradient-to-br from-success/10 to-success/5"
          onClick={() => {
            setSelectedStat("person");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Pessoa Jurídica"
          value={stats.company}
          icon={Building2}
          className="bg-gradient-to-br from-warning/10 to-warning/5"
          onClick={() => {
            setSelectedStat("company");
            setDetailsDialogOpen(true);
          }}
        />
        <StatsCard
          title="Com Documento"
          value={stats.withDocument}
          icon={FileText}
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          onClick={() => {
            setSelectedStat("document");
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
                placeholder="Buscar por nome, CPF/CNPJ, telefone, email, endereço..."
        />
          </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                  <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
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
          {(searchTerm || typeFilter !== "all") && (
            <div className="mt-3 text-sm text-muted-foreground">
              Mostrando {sortedClients?.length || 0} de {totalCount} {totalCount === 1 ? "cliente" : "clientes"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[150px]">
                <div className="flex items-center justify-center gap-1">
                  Nome
                  <SortButton field="name" />
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1">
                  Tipo
                  <SortButton field="type" />
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[120px]">
                CPF/CNPJ
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1">
                  Telefone
                  <SortButton field="phone" />
                </div>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[150px]">
                Email
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[150px]">
                Endereço
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-2 sm:px-4 text-xs sm:text-sm w-20 text-center">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Nenhum cliente encontrado</span>
                    <span className="text-sm text-muted-foreground/60">
                      {searchTerm || typeFilter !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Cadastre um novo cliente para começar"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedClients?.map((client: any, index: number) => (
                <TableRow 
                  key={client.id} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onDoubleClick={() => handleEdit(client)}
                >
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm max-w-[150px] truncate">
                    {client.name}
                  </TableCell>
                  <TableCell className="border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm text-center">
                    {client.type === "person" ? (
                      <Badge className="bg-success/20 text-success hover:bg-success/30">
                        <User className="w-3 h-3 mr-1" />
                        PF
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/20 text-warning hover:bg-warning/30">
                        <Building2 className="w-3 h-3 mr-1" />
                        PJ
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center font-mono text-[10px] sm:text-xs">
                    {client.cpf_cnpj ? (
                      <Badge variant="outline" className="font-mono">
                        {client.cpf_cnpj}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-center">
                    {client.phone || <span className="text-muted-foreground/60">-</span>}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm max-w-[150px] truncate">
                    {client.email ? (
                      <div className="flex items-center gap-1 justify-center">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[150px] truncate border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm">
                    {client.address || <span className="text-muted-foreground/60">-</span>}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-2 sm:px-4 text-xs sm:text-sm w-20">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                        aria-label="Editar cliente"
                        title="Editar cliente"
                        className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                        aria-label="Excluir cliente"
                        title="Excluir cliente"
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
      </div>

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
            <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do cliente abaixo." : "Preencha os dados para cadastrar um novo cliente ou fornecedor."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo / Razão Social *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, name: value }))}
                placeholder="Digite o nome completo ou razão social"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, type: value, cpf_cnpj: "" });
                    setValidationErrors({ ...validationErrors, cpf_cnpj: undefined });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">
                  {formData.type === "Pessoa Física" ? "CPF" : "CNPJ"}
                </Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value.replace(/[^\d]/g, "");
                    let formatted = value;
                    
                    if (formData.type === "Pessoa Física") {
                      // Limita a 11 dígitos e formata como CPF
                      if (cleanValue.length <= 11) {
                        formatted = formatCPF(cleanValue);
                      } else {
                        formatted = formData.cpf_cnpj;
                      }
                    } else {
                      // Limita a 14 dígitos e formata como CNPJ
                      if (cleanValue.length <= 14) {
                        formatted = formatCNPJ(cleanValue);
                      } else {
                        formatted = formData.cpf_cnpj;
                      }
                    }
                    
                    setFormData({ ...formData, cpf_cnpj: formatted });
                    // Limpa erro quando começa a digitar
                    if (validationErrors.cpf_cnpj) {
                      setValidationErrors({ ...validationErrors, cpf_cnpj: undefined });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && value.trim()) {
                      const cleanValue = value.replace(/[^\d]/g, "");
                      const errors: { cpf_cnpj?: string } = {};
                      
                      if (formData.type === "Pessoa Física") {
                        if (cleanValue.length === 11 && !validateCPF(value)) {
                          errors.cpf_cnpj = "CPF inválido";
                        } else if (cleanValue.length !== 11 && cleanValue.length > 0) {
                          errors.cpf_cnpj = "CPF deve ter 11 dígitos";
                        }
                      } else {
                        if (cleanValue.length === 14 && !validateCNPJ(value)) {
                          errors.cpf_cnpj = "CNPJ inválido";
                        } else if (cleanValue.length !== 14 && cleanValue.length > 0) {
                          errors.cpf_cnpj = "CNPJ deve ter 14 dígitos";
                        }
                      }
                      
                      setValidationErrors({ ...validationErrors, ...errors });
                    }
                  }}
                  className={validationErrors.cpf_cnpj ? "border-destructive" : ""}
                  placeholder={formData.type === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
                {validationErrors.cpf_cnpj && (
                  <p className="text-xs text-destructive">{validationErrors.cpf_cnpj}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                  type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  const cleanValue = value.replace(/[^\d]/g, "");
                  
                  // Limita a 11 dígitos e formata
                  if (cleanValue.length <= 11) {
                    const formatted = formatPhone(cleanValue);
                    setFormData({ ...formData, phone: formatted });
                  } else {
                    setFormData({ ...formData, phone: formData.phone });
                  }
                  
                  // Limpa erro quando começa a digitar
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: undefined });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && value.trim() && !validatePhone(value)) {
                    setValidationErrors({ 
                      ...validationErrors, 
                      phone: "Telefone inválido (deve ter 10 ou 11 dígitos)" 
                    });
                  } else if (value && value.trim() && validatePhone(value)) {
                    setValidationErrors({ ...validationErrors, phone: undefined });
                  }
                }}
                className={validationErrors.phone ? "border-destructive" : ""}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              {validationErrors.phone && (
                <p className="text-xs text-destructive">{validationErrors.phone}</p>
              )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: undefined });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && !validateEmail(value)) {
                      setValidationErrors({ 
                        ...validationErrors, 
                        email: "Email inválido" 
                      });
                    } else {
                      setValidationErrors({ ...validationErrors, email: undefined });
                    }
                  }}
                  className={validationErrors.email ? "border-destructive" : ""}
                  placeholder="exemplo@email.com"
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, address: value }))}
                placeholder="Rua, número, complemento, bairro, cidade - UF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Anotações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, notes: value }))}
                rows={3}
                placeholder="Informações adicionais sobre o cliente..."
              />
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
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e pode afetar registros relacionados (receitas, despesas, processos, etc.).
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
              {selectedStat === "total" && "Detalhes - Total de Clientes"}
              {selectedStat === "person" && "Detalhes - Pessoa Física"}
              {selectedStat === "company" && "Detalhes - Pessoa Jurídica"}
              {selectedStat === "document" && "Detalhes - Clientes com Documento"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todos os ${stats.total} clientes cadastrados.`}
              {selectedStat === "person" && `Lista dos ${stats.person} clientes pessoa física.`}
              {selectedStat === "company" && `Lista dos ${stats.company} clientes pessoa jurídica.`}
              {selectedStat === "document" && `Lista dos ${stats.withDocument} clientes com documento cadastrado.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStat === "total" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.map((client: any) => {
                      const isPerson = client.type === "person" || client.type === "Pessoa Física";
                      const displayType = client.type === "person" ? "Pessoa Física" : client.type === "company" ? "Pessoa Jurídica" : client.type || "-";
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={isPerson ? "default" : "secondary"}>
                              {displayType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {client.cpf_cnpj ? (isPerson ? formatCPF(client.cpf_cnpj) : formatCNPJ(client.cpf_cnpj)) : "-"}
                          </TableCell>
                          <TableCell>{client.phone || "-"}</TableCell>
                          <TableCell>{client.email || "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "person" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.filter((c: any) => c.type === "person" || c.type === "Pessoa Física").map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name || "-"}</TableCell>
                        <TableCell>{client.cpf_cnpj ? formatCPF(client.cpf_cnpj) : "-"}</TableCell>
                        <TableCell>{client.phone || "-"}</TableCell>
                        <TableCell>{client.email || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "company" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.filter((c: any) => c.type === "company" || c.type === "Pessoa Jurídica").map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name || "-"}</TableCell>
                        <TableCell>{client.cpf_cnpj ? formatCNPJ(client.cpf_cnpj) : "-"}</TableCell>
                        <TableCell>{client.phone || "-"}</TableCell>
                        <TableCell>{client.email || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "document" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.filter((c: any) => c.cpf_cnpj).map((client: any) => {
                      const isPerson = client.type === "person" || client.type === "Pessoa Física";
                      const displayType = client.type === "person" ? "Pessoa Física" : client.type === "company" ? "Pessoa Jurídica" : client.type || "-";
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={isPerson ? "default" : "secondary"}>
                              {displayType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isPerson ? formatCPF(client.cpf_cnpj) : formatCNPJ(client.cpf_cnpj)}
                          </TableCell>
                          <TableCell>{client.phone || "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
