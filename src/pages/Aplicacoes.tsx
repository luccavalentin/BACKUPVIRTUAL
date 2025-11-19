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
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { BankSearchInput } from "@/components/BankSearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/layout/StatsCard";
import { BarChart3, PieChart as PieChartIcon, Layers3, CalendarClock, Landmark } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";

export default function Aplicacoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: "",
    type: "",
    institution: "",
    amount: "",
    application_date: "",
    maturity_date: "",
    interest_rate: "",
    profitability: "",
    status: "Ativa",
    notes: "",
  });
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newType, setNewType] = useState("");

  const { data: applications = [], error: applicationsError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .order("application_date", { ascending: false });
        
        if (error) {
          // Se a tabela não existe (404), retorna array vazio sem erro
          const errorMessage = error.message || "";
          const errorCode = (error as any).code || "";
          
          if (errorCode === "PGRST116" || 
              errorMessage.includes("404") || 
              errorMessage.includes("Not Found") ||
              errorMessage.includes("Could not find the table") ||
              errorMessage.includes("schema cache") ||
              (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
            console.warn("Tabela 'applications' não encontrada. Execute a migração: 20251115120000_create_applications_table.sql");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (err: any) {
        // Captura erros de rede ou outros erros
        const errorMessage = err?.message || "";
        if (errorMessage.includes("404") || 
            errorMessage.includes("Not Found") ||
            errorMessage.includes("Could not find the table") ||
            errorMessage.includes("schema cache")) {
          console.warn("Tabela 'applications' não encontrada. Execute a migração: 20251115120000_create_applications_table.sql");
          return [];
        }
        throw err;
      }
    },
    retry: false,
  });

  // Verifica se a tabela não existe (erro 404)
  const errorMessage = applicationsError?.message || "";
  const errorCode = (applicationsError as any)?.code || "";
  const isTableNotFound = errorCode === "PGRST116" || 
                          errorMessage.includes("404") || 
                          errorMessage.includes("Not Found") ||
                          errorMessage.includes("Could not find the table") ||
                          errorMessage.includes("schema cache") ||
                          (errorMessage.includes("relation") && errorMessage.includes("does not exist"));

  const { searchTerm, setSearchTerm, filteredData: filteredApplications, resultCount, totalCount } = useSmartSearch(
    applications,
    ["description", "type", "institution", "status"]
  );

  const { sortedData: sortedApplications, SortButton } = useTableSort(filteredApplications);

  const [keepDialogOpen, setKeepDialogOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("applications").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Aplicação cadastrada com sucesso!" });
      if (keepDialogOpen) {
        setFormData({
          description: "",
          type: "",
          institution: "",
          amount: "",
          application_date: "",
          maturity_date: "",
          interest_rate: "",
          profitability: "",
          status: "Ativa",
          notes: "",
        });
        setKeepDialogOpen(false);
      } else {
      handleCloseDialog();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("applications").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Aplicação atualizada com sucesso!" });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Aplicação excluída com sucesso!" });
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
    const data = {
      ...formData,
      description: standardizeText(formData.description),
      type: formData.type ? standardizeText(formData.type) : null,
      institution: formData.institution ? standardizeText(formData.institution) : null,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      profitability: formData.profitability ? parseFloat(formData.profitability) : null,
      application_date: formData.application_date || null,
      maturity_date: formData.maturity_date || null,
      notes: formData.notes ? standardizeText(formData.notes) : null,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (application: any) => {
    setEditingId(application.id);
    setFormData({
      description: application.description || "",
      type: application.type || "",
      institution: application.institution || "",
      amount: application.amount?.toString() || "",
      application_date: application.application_date || "",
      maturity_date: application.maturity_date || "",
      interest_rate: application.interest_rate?.toString() || "",
      profitability: application.profitability?.toString() || "",
      status: application.status || "Ativa",
      notes: application.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setShowNewTypeInput(false);
    setNewType("");
    setFormData({
      description: "",
      type: "",
      institution: "",
      amount: "",
      application_date: "",
      maturity_date: "",
      interest_rate: "",
      profitability: "",
      status: "Ativa",
      notes: "",
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setShowNewTypeInput(false);
    setNewType("");
    setFormData({
      description: "",
      type: "",
      institution: "",
      amount: "",
      application_date: "",
      maturity_date: "",
      interest_rate: "",
      profitability: "",
      status: "Ativa",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-success/10 text-success";
      case "Resgatada":
        return "bg-primary/10 text-primary";
      case "Vencida":
        return "bg-warning/10 text-warning";
      case "Cancelada":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

const chartColors = ["#2563eb", "#f97316", "#16a34a", "#a855f7", "#0ea5e9", "#f43f5e"];
const statusColorMap: Record<string, string> = {
  Ativa: "#16a34a",
  Resgatada: "#2563eb",
  Vencida: "#f59e0b",
  Cancelada: "#dc2626",
};

const now = new Date();

const calculateStats = (applications: any[]) => {
  if (!applications?.length) {
    return { totalInvested: 0, activeInvestments: 0, avgRate: 0, redeemedValue: 0, upcomingMaturities: 0 };
  }

  const totalInvested = applications.reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
  const activeInvestments = applications.filter((app) => app.status === "Ativa");
  const avgRate = activeInvestments.length
    ? activeInvestments.reduce((sum, app) => sum + (Number(app.interest_rate) || 0), 0) / activeInvestments.length
    : 0;
  const redeemedValue = applications
    .filter((app) => app.status === "Resgatada")
    .reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
  const upcomingWindow = addDays(now, 60);
  const upcomingMaturities = applications.filter((app) => {
    if (!app.maturity_date) return false;
    const maturity = new Date(app.maturity_date);
    return maturity >= now && maturity <= upcomingWindow;
  }).length;

  return { totalInvested, activeInvestments: activeInvestments.length, avgRate, redeemedValue, upcomingMaturities };
};


  const stats = useMemo(() => calculateStats(applications), [applications]);

  const investmentByType = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((app: any) => {
      const key = app.type || "Outros";
      map.set(key, (map.get(key) || 0) + (Number(app.amount) || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const statusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((app: any) => {
      const key = app.status || "Outros";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: statusColorMap[name] || "#94a3b8",
    }));
  }, [applications]);

  const institutionComparison = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((app: any) => {
      const key = app.institution || "Outras";
      map.set(key, (map.get(key) || 0) + (Number(app.amount) || 0));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [applications]);

  const maturityTimeline = useMemo(() => {
    const map = new Map<string, { label: string; value: number; date: Date }>();
    applications.forEach((app: any) => {
      if (!app.maturity_date || !app.amount) return;
      const date = new Date(app.maturity_date);
      const key = format(date, "yyyy-MM");
      const label = format(date, "MMM/yy", { locale: ptBR });
      const existing = map.get(key);
      if (existing) {
        existing.value += Number(app.amount) || 0;
      } else {
        map.set(key, { label, value: Number(app.amount) || 0, date });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }, [applications]);

  const profitabilityLeaders = useMemo(() => {
    return [...applications]
      .map((app: any) => ({
        ...app,
        metric: Number(app.profitability) || Number(app.interest_rate) || 0,
      }))
      .filter((app) => app.metric > 0)
      .sort((a, b) => b.metric - a.metric)
      .slice(0, 5);
  }, [applications]);

  const upcomingMaturities = useMemo(() => {
    return [...applications]
      .filter((app: any) => app.maturity_date)
      .sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime())
      .slice(0, 5);
  }, [applications]);

  const hasAnalytics = applications.length > 0;

  return (
    <div>
      <PageHeader
        title="Aplicações"
        description="Gerencie todos os investimentos e aplicações financeiras"
        action={{
          label: "Nova Aplicação",
          onClick: handleNewItem,
        }}
      />

      {/* DASHBOARD INTERATIVO DE APLICAÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Investido" value={formatCurrency(stats.totalInvested)} icon={Layers3} />
        <StatsCard title="Investimentos Ativos" value={String(stats.activeInvestments)} icon={BarChart3} />
        <StatsCard title="Rentabilidade Média (%)" value={String(stats.avgRate.toFixed(2))} icon={PieChartIcon} />
        <StatsCard title="Valor Resgatado" value={formatCurrency(stats.redeemedValue)} icon={Landmark} />
      </div>

      {hasAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Gráfico: Investimento por Tipo */}
          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold">Investimento por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={investmentByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {investmentByType.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={formatCurrency} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico: Distribuição por Status */}
          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {statusDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico: Comparativo por Instituição */}
          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold">Comparativo por Instituição</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={institutionComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={formatCurrency} />
                  <RechartsTooltip formatter={formatCurrency} />
                  <Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico: Próximos Vencimentos */}
          <Card className="shadow-elegant border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold">Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={maturityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={formatCurrency} />
                  <RechartsTooltip formatter={formatCurrency} />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {isTableNotFound && (
        <div className="mb-4 p-4 bg-warning/10 rounded-lg shadow-sm">
          <p className="text-sm text-warning-foreground font-medium mb-2">
            ⚠️ Tabela 'applications' não encontrada no banco de dados.
          </p>
          <p className="text-xs text-muted-foreground">
            Execute a migração <code className="bg-muted px-1 rounded">20251115120000_create_applications_table.sql</code> no Supabase para criar a tabela.
          </p>
        </div>
      )}

      {applicationsError && !isTableNotFound && (
        <div className="mb-4 p-4 bg-destructive/10 rounded-lg shadow-sm">
          <p className="text-sm text-destructive font-medium">
            Erro ao carregar aplicações: {applicationsError.message}
          </p>
        </div>
      )}

      {applications.length === 0 && !applicationsError && !isTableNotFound && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg shadow-sm">
          <p className="text-sm text-muted-foreground">
            Nenhuma aplicação cadastrada. Clique em "Nova Aplicação" para começar.
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-elegant-lg border border-border/50 overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0 min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/30 hover:bg-transparent">
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 rounded-tl-xl px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="description">Descrição</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="type">Tipo</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="institution">Instituição</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="application_date">Data Aplicação</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="maturity_date">Vencimento</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="interest_rate">Taxa (%)</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="status">Status</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs text-center">
                <SortButton column="amount">Valor</SortButton>
              </TableHead>
              <TableHead className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm font-bold border-r border-border/50 px-1.5 sm:px-2 text-xs w-16 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground/70 border-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/30 border-2 border-border/50 flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <span className="font-medium">Nenhuma aplicação cadastrada</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedApplications?.map((application, index) => (
                <TableRow
                  key={application.id}
                  className={`border-b border-border/30 hover:bg-primary/10 cursor-pointer transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}`}
                  onClick={() => {
                    setSelectedApplication(application.id);
                    setDetailsDialogOpen(true);
                  }}
                >
                        {/* Dialog de detalhes da aplicação */}
                        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Aplicação</DialogTitle>
                            </DialogHeader>
                            {selectedApplication && (
                              (() => {
                                const application = sortedApplications?.find((a) => a.id === selectedApplication);
                                if (!application) return null;
                                return (
                                  <div className="space-y-2">
                                    <div><b>Descrição:</b> {application.description}</div>
                                    <div><b>Tipo:</b> {application.type}</div>
                                    <div><b>Instituição:</b> {application.institution}</div>
                                    <div><b>Data Aplicação:</b> {application.application_date ? format(new Date(application.application_date), "dd/MM/yyyy") : "-"}</div>
                                    <div><b>Vencimento:</b> {application.maturity_date ? format(new Date(application.maturity_date), "dd/MM/yyyy") : "-"}</div>
                                    <div><b>Taxa (%):</b> {application.interest_rate ? `${application.interest_rate}%` : "-"}</div>
                                    <div><b>Status:</b> {application.status}</div>
                                    <div><b>Valor:</b> {application.amount ? formatCurrency(application.amount) : "-"}</div>
                                    <div><b>Notas:</b> {application.notes || "-"}</div>
                                  </div>
                                );
                              })()
                            )}
                          </DialogContent>
                        </Dialog>
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[120px] truncate text-center">{application.description}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">{application.type || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs max-w-[100px] truncate text-center">{application.institution || "-"}</TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {application.application_date ? format(new Date(application.application_date), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {application.maturity_date ? format(new Date(application.maturity_date), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap text-center">
                    {application.interest_rate ? `${application.interest_rate}%` : "-"}
                  </TableCell>
                  <TableCell className="border-r border-border/30 px-1.5 sm:px-2 text-xs text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold shadow-sm whitespace-nowrap ${getStatusColor(application.status || "")} ${
                      application.status === "Ativa" ? "bg-success/20" :
                      application.status === "Resgatada" ? "bg-primary/20" :
                      application.status === "Vencida" ? "bg-warning/20" :
                      application.status === "Cancelada" ? "bg-destructive/20" :
                      "bg-muted/20"
                    }`}>
                      {application.status || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-success border-r border-border/30 px-1.5 sm:px-2 text-xs whitespace-nowrap">
                    {application.amount ? formatCurrency(application.amount) : "-"}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 px-1.5 sm:px-2 text-xs w-16">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(application)}
                        aria-label="Editar aplicação"
                        title="Editar aplicação"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(application.id)}
                        aria-label="Excluir aplicação"
                        title="Excluir aplicação"
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
            <DialogTitle>{editingId ? "Editar Aplicação" : "Nova Aplicação"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados da aplicação abaixo." : "Preencha os dados para cadastrar uma nova aplicação."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, description: value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Aplicação</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => {
                    if (value === "Outros") {
                      setShowNewTypeInput(true);
                      setFormData({ ...formData, type: "" });
                    } else {
                      setShowNewTypeInput(false);
                      setNewType("");
                      setFormData({ ...formData, type: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="CDB">CDB</SelectItem>
                    <SelectItem value="LCI">LCI</SelectItem>
                    <SelectItem value="LCA">LCA</SelectItem>
                    <SelectItem value="Tesouro Direto">Tesouro Direto</SelectItem>
                    <SelectItem value="Poupança">Poupança</SelectItem>
                    <SelectItem value="Fundos de Investimento">Fundos de Investimento</SelectItem>
                    <SelectItem value="Ações">Ações</SelectItem>
                    <SelectItem value="Debêntures">Debêntures</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {showNewTypeInput && (
                  <div className="space-y-2 mt-2">
                    <Input
                      id="newType"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      placeholder="Digite o novo tipo de aplicação"
                      onBlur={(e) => {
                        const standardized = standardizeText(e.target.value);
                        setNewType(standardized);
                        if (standardized) {
                          setFormData({ ...formData, type: standardized });
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newType.trim()) {
                          const standardized = standardizeText(newType.trim());
                          setFormData({ ...formData, type: standardized });
                          setShowNewTypeInput(false);
                          setNewType("");
                          toast({ title: "Novo tipo cadastrado!" });
                        }
                      }}
                      className="w-full"
                    >
                      Cadastrar Novo Tipo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição Financeira</Label>
                <BankSearchInput
                  value={formData.institution}
                  onChange={(value) => setFormData({ ...formData, institution: value })}
                  placeholder="Buscar instituição financeira..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor Aplicado *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_date">Data de Aplicação</Label>
                <Input
                  id="application_date"
                  type="date"
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturity_date">Data de Vencimento</Label>
                <Input
                  id="maturity_date"
                  type="date"
                  value={formData.maturity_date}
                  onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Resgatada">Resgatada</SelectItem>
                    <SelectItem value="Vencida">Vencida</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Taxa de Juros (%)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  placeholder="Ex: 12.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profitability">Rentabilidade (R$)</Label>
                <Input
                  id="profitability"
                  type="number"
                  step="0.01"
                  value={formData.profitability}
                  onChange={(e) => setFormData({ ...formData, profitability: e.target.value })}
                  placeholder="Valor do rendimento"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Informações adicionais sobre a aplicação..."
              />
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



