import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { SmartSearchInput } from "@/components/SmartSearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { CheckCircle2, Circle, Pencil, Trash2, Filter, CheckSquare, AlertCircle, Download, FileText } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip as RechartsTooltip
} from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, addDays, addWeeks, addMonths, addYears, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { standardizeText, handleStandardizeInput } from "@/lib/validations";
import * as XLSX from "xlsx";

type TaskStatus = "pendente" | "em_andamento" | "concluida";
type TaskPriority = "baixa" | "media" | "alta";

const statusLabels: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
};

const priorityLabels: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const statusColors: Record<TaskStatus, string> = {
  pendente: "bg-warning/20 text-warning border-warning/30 border-2 font-semibold",
  em_andamento: "bg-primary/20 text-primary border-primary/30 border-2 font-semibold",
  concluida: "bg-success/20 text-success border-success/30 border-2 font-semibold",
};

const priorityColors: Record<TaskPriority, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-warning/10 text-warning",
  alta: "bg-destructive/10 text-destructive",
};

export default function Tarefas() {
  // Funções auxiliares
  const getTaskStatus = (task: any): TaskStatus => {
    return task.status || (task.completed ? "concluida" : "pendente");
  };

  const getTaskPriority = (task: any): TaskPriority => {
    return task.priority || "media";
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Função para verificar se tarefa está atrasada
  const isTaskOverdue = (task: any) => {
    if (!task.due_date) return false;
    const status = getTaskStatus(task);
    return isOverdue(task.due_date) && status !== "concluida";
  };

  // Custom Tooltip for PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        {name}: {value} tarefa(s)
      </div>
    );
  };

  // Custom Tooltip for BarChart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const { month, value } = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        {month}: {value} tarefa(s)
      </div>
    );
  };
  // ...existing code...
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "todos">("todos");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "todos">("todos");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pendente" as TaskStatus,
    priority: "media" as TaskPriority,
    category: "",
    recurrence_type: "" as "diaria" | "semanal" | "mensal" | "anual" | "personalizada" | "",
    recurrence_end_date: "",
    recurrence_interval: 1,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*");
      if (error) throw error;
      // Ordenar: vencidas primeiro, depois por data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.sort((a: any, b: any) => {
        const aStatus = a.status || (a.completed ? "concluida" : "pendente");
        const bStatus = b.status || (b.completed ? "concluida" : "pendente");
        const aDate = new Date(a.due_date);
        aDate.setHours(0, 0, 0, 0);
        const bDate = new Date(b.due_date);
        bDate.setHours(0, 0, 0, 0);
        const aOverdue = aDate < today && aStatus !== "concluida";
        const bOverdue = bDate < today && bStatus !== "concluida";
        // Tarefas vencidas primeiro
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        // Depois por data
        return aDate.getTime() - bDate.getTime();
      });
    },
  });

  // Definitions that depend on tasks
  const stats = {
    total: tasks?.length || 0,
    pendentes: tasks?.filter((t: any) => getTaskStatus(t) === "pendente").length || 0,
    emAndamento: tasks?.filter((t: any) => getTaskStatus(t) === "em_andamento").length || 0,
    concluidas: tasks?.filter((t: any) => getTaskStatus(t) === "concluida").length || 0,
    atrasadas: tasks?.filter((t: any) => isTaskOverdue(t)).length || 0,
  };

  const statusPieData = [
    { name: "Pendente", value: stats.pendentes, color: "hsl(var(--warning))" },
    { name: "Em Andamento", value: stats.emAndamento, color: "hsl(var(--primary))" },
    { name: "Concluída", value: stats.concluidas, color: "hsl(var(--success))" },
  ];

  const priorityPieData = [
    { name: "Baixa", value: tasks?.filter((t: any) => getTaskPriority(t) === "baixa").length || 0, color: "hsl(var(--muted-foreground))" },
    { name: "Média", value: tasks?.filter((t: any) => getTaskPriority(t) === "media").length || 0, color: "hsl(var(--warning))" },
    { name: "Alta", value: tasks?.filter((t: any) => getTaskPriority(t) === "alta").length || 0, color: "hsl(var(--destructive))" },
  ];

  const tasksByMonth = useMemo(() => {
    if (!tasks) return [];
    const months: Record<string, number> = {};
    tasks.forEach((t: any) => {
      if (!t.created_at) return;
      const date = new Date(t.created_at);
      const key = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([month, value]) => ({ month, value })).sort((a, b) => a.month.localeCompare(b.month));
  }, [tasks]);

  // Filtrar tarefas
  // Limpar seleção quando filtros mudarem ou tarefas mudarem
  useEffect(() => {
    setSelectedTasks(new Set());
  }, [filterStatus, filterPriority, tasks]);

  const filteredTasks = tasks?.filter((task: any) => {
    const status = task.status || (task.completed ? "concluida" : "pendente");
    const priority = task.priority || "media";
    
    if (filterStatus !== "todos" && status !== filterStatus) return false;
    if (filterPriority !== "todos" && priority !== filterPriority) return false;
    
    return true;
  });

  // ...código já movido para o topo...

  const handleExportPDF = () => {
    if (!tasks || tasks.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há tarefas cadastradas para exportar.",
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
      doc.text("Relatório de Tarefas", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const tableData = tasks.map((task: any) => [
        task.title || "",
        task.description || "",
        statusLabels[getTaskStatus(task)] || "",
        priorityLabels[getTaskPriority(task)] || "",
        task.category || "",
        task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "",
        isTaskOverdue(task) ? "Sim" : "Não",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Título", "Descrição", "Status", "Prioridade", "Categoria", "Data Vencimento", "Atrasada"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin },
      });

      const fileName = `Tarefas_${format(new Date(), "dd-MM-yyyy")}.pdf`;
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
    if (!tasks || tasks.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há tarefas cadastradas para exportar.",
        variant: "destructive",
      });
      return;
    }

    const data = tasks.map((task: any) => ({
      Título: task.title || "",
      Descrição: task.description || "",
      Status: statusLabels[getTaskStatus(task)] || "",
      Prioridade: priorityLabels[getTaskPriority(task)] || "",
      Categoria: task.category || "",
      "Data de Vencimento": task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Data de Criação": task.created_at ? format(new Date(task.created_at), "dd/MM/yyyy", { locale: ptBR }) : "",
      Atrasada: isTaskOverdue(task) ? "Sim" : "Não",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tarefas");
    XLSX.writeFile(wb, `tarefas_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${tasks.length} tarefa(s) exportada(s) com sucesso.`,
    });
  };

  // Busca inteligente com suporte a "atraso"
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchedTasks = useMemo(() => {
    if (!filteredTasks || !searchTerm.trim()) return filteredTasks;

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    // Verifica se busca por "atraso" ou "atrasada"
    const isSearchingOverdue = normalizedSearch.includes("atras") || normalizedSearch.includes("venc");

    return filteredTasks.filter((task: any) => {
      // Se busca por "atraso", retorna apenas tarefas atrasadas
      if (isSearchingOverdue) {
        return isTaskOverdue(task);
      }

      // Busca normal nos campos
      const searchableFields = ["title", "description", "category"];
      return searchableFields.some((field) => {
        const value = task[field];
        if (value === null || value === undefined) return false;
        const normalizedValue = String(value)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return normalizedValue.includes(normalizedSearch);
      });
    });
  }, [filteredTasks, searchTerm]);
  
  const resultCount = searchedTasks?.length || 0;
  const totalCount = filteredTasks?.length || 0;

  const { sortedData: sortedTasks, SortButton } = useTableSort(searchedTasks);

  // Função para gerar tarefas recorrentes
  const generateRecurringTasks = (
    parentTaskId: string,
    baseTask: any,
    recurrenceType: string,
    startDate: string,
    endDate?: string,
    interval: number = 1
  ) => {
    const tasks: any[] = [];
    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : addYears(start, 1); // Padrão: 1 ano se não especificado
    let currentDate = start;

    const getNextDate = (date: Date, type: string, interval: number): Date => {
      switch (type) {
        case "diaria":
          return addDays(date, interval);
        case "semanal":
          return addWeeks(date, interval);
        case "mensal":
          return addMonths(date, interval);
        case "anual":
          return addYears(date, interval);
        default:
          return addDays(date, interval);
      }
    };

    // Gerar tarefas até a data final
    while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
      if (currentDate.getTime() !== start.getTime()) {
        // Não incluir a data inicial (já é a tarefa pai)
        tasks.push({
          ...baseTask,
          parent_task_id: parentTaskId,
          due_date: format(currentDate, "yyyy-MM-dd"),
          recurrence_type: null, // Tarefas filhas não têm recorrência
        });
      }
      currentDate = getNextDate(currentDate, recurrenceType, interval);
    }

    return tasks;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Garantir que a data seja enviada no formato correto (YYYY-MM-DD) sem conversão de timezone
      const dueDate = data.due_date ? data.due_date.split('T')[0] : data.due_date;
      const recurrenceEndDate = data.recurrence_end_date ? data.recurrence_end_date.split('T')[0] : data.recurrence_end_date;
      
      const baseTask = {
        title: standardizeText(data.title),
        description: data.description ? standardizeText(data.description) : null,
        due_date: dueDate,
        completed: data.status === "concluida",
        status: data.status,
        priority: data.priority,
        category: data.category ? standardizeText(data.category) : null,
        recurrence_type: data.recurrence_type || null,
        recurrence_end_date: recurrenceEndDate || null,
        recurrence_interval: data.recurrence_interval || 1,
      };

      // Se não há recorrência, cria apenas uma tarefa
      if (!data.recurrence_type) {
        const { error } = await supabase.from("reminders").insert([baseTask]);
        if (error) throw error;
        return;
      }

      // Se há recorrência, cria a tarefa pai e as tarefas recorrentes
      const { data: parentTask, error: parentError } = await supabase
        .from("reminders")
        .insert([{ ...baseTask, recurrence_type: data.recurrence_type }])
        .select()
        .single();
      
      if (parentError) throw parentError;
      if (!parentTask) throw new Error("Erro ao criar tarefa pai");

      // Criar tarefas recorrentes
      const recurringTasks = generateRecurringTasks(
        parentTask.id,
        baseTask,
        data.recurrence_type,
        data.due_date,
        data.recurrence_end_date,
        data.recurrence_interval
      );

      if (recurringTasks.length > 0) {
        const { error: recurringError } = await supabase
          .from("reminders")
          .insert(recurringTasks);
        
        if (recurringError) throw recurringError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Tarefa criada com sucesso!" });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Garantir que a data seja enviada no formato correto (YYYY-MM-DD) sem conversão de timezone
      const dueDate = data.due_date ? data.due_date.split('T')[0] : data.due_date;
      const recurrenceEndDate = data.recurrence_end_date ? data.recurrence_end_date.split('T')[0] : data.recurrence_end_date;
      
      const { error } = await supabase.from("reminders").update({
        title: standardizeText(data.title),
        description: data.description ? standardizeText(data.description) : null,
        due_date: dueDate,
        completed: data.status === "concluida",
        status: data.status,
        priority: data.priority,
        category: data.category ? standardizeText(data.category) : null,
        recurrence_type: data.recurrence_type || null,
        recurrence_end_date: recurrenceEndDate || null,
        recurrence_interval: data.recurrence_interval || 1,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Tarefa atualizada com sucesso!" });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Tarefa excluída com sucesso!" });
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("reminders").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setSelectedTasks(new Set());
      toast({ 
        title: "Tarefas excluídas com sucesso!", 
        description: `${count} ${count === 1 ? 'tarefa foi excluída' : 'tarefas foram excluídas'}.`
      });
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir tarefas", 
        description: error.message || "Ocorreu um erro ao excluir as tarefas.",
        variant: "destructive"
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("reminders").update({
        status,
        completed: status === "concluida",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    // Garantir que a data seja formatada corretamente para o input (YYYY-MM-DD)
    // Sem conversão de timezone - usa a data exata como está no banco
    const formatDateForInput = (dateString: string | null | undefined) => {
      if (!dateString) return "";
      // Se já está no formato YYYY-MM-DD, retorna direto
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
      // Se tem timestamp ou timezone, extrai apenas a parte da data (YYYY-MM-DD)
      // Usa split para pegar apenas a parte da data antes de qualquer T ou espaço
      const datePart = dateString.split('T')[0].split(' ')[0];
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) return datePart;
      // Fallback: se não conseguir, tenta criar Date e usar métodos locais
      const date = new Date(dateString + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFormData({
      title: task.title,
      description: task.description || "",
      due_date: formatDateForInput(task.due_date),
      status: (task.status || (task.completed ? "concluida" : "pendente")) as TaskStatus,
      priority: (task.priority || "media") as TaskPriority,
      category: task.category || "",
      recurrence_type: task.recurrence_type || "",
      recurrence_end_date: formatDateForInput(task.recurrence_end_date),
      recurrence_interval: task.recurrence_interval || 1,
    });
    setIsDialogOpen(true);
  };

  const handleToggleSelectAll = () => {
    if (selectedTasks.size === sortedTasks?.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sortedTasks?.map((task: any) => task.id) || []));
    }
  };

  const handleToggleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedTasks.size > 0) {
      deleteMultipleMutation.mutate(Array.from(selectedTasks));
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "pendente",
      priority: "media",
      category: "",
      recurrence_type: "",
      recurrence_end_date: "",
      recurrence_interval: 1,
    });
  };

  const handleNewItem = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "pendente",
      priority: "media",
      category: "",
      recurrence_type: "",
      recurrence_end_date: "",
      recurrence_interval: 1,
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Gestão de Tarefas"
        description="Organize e acompanhe todas as suas tarefas e atividades"
        action={{
          label: "Nova Tarefa",
          onClick: handleNewItem,
        }}
      />


      {/* Ações rápidas + paginação alinhada à direita */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <QuickActions />
        </div>
        <div className="flex gap-2 justify-end md:justify-end">
          <span className="px-4 py-2 rounded-lg bg-white shadow text-muted-foreground font-medium text-sm border border-muted">Página 1 de 2</span>
          <Button variant="outline" className="px-2 py-1 rounded-lg shadow font-medium text-xs">
            Próximo &rarr;
          </Button>
        </div>
      </div>

      {/* Dashboards e Analíticos de Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de Status */}
        <Card className="border-0 shadow-elegant bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Status das Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={false}
                  labelLine={false}
                >
                  {statusPieData.map((entry, idx) => (
                    <Cell key={`cell-status-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={CustomPieTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legendas centralizadas e próximas ao gráfico */}
            <div className="flex flex-row flex-wrap justify-center items-center gap-6 mt-2 w-full">
              {statusPieData.filter(l => l.value > 0).map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2 min-w-[80px] max-w-full break-words justify-center">
                  <span style={{ width: 14, height: 14, background: entry.color, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
                  <span className="font-semibold text-xs" style={{ color: entry.color, wordBreak: 'break-word' }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Prioridade */}
        <Card className="border-0 shadow-elegant bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Prioridade das Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={priorityPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={false}
                  labelLine={false}
                >
                  {priorityPieData.map((entry, idx) => (
                    <Cell key={`cell-priority-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={CustomPieTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legendas abaixo do gráfico, responsivas e sem corte */}
            <div className="flex flex-row flex-wrap justify-center items-center gap-3 mt-4 px-2 w-full">
              {priorityPieData.filter(l => l.value > 0).map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2 min-w-[80px] max-w-full break-words">
                  <span style={{ width: 12, height: 12, background: entry.color, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
                  <span className="font-semibold text-xs" style={{ color: '#222', wordBreak: 'break-word' }}>{entry.name}: <span style={{ color: entry.color }}>{entry.value}</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tarefas por Mês */}
        <Card className="border-0 shadow-elegant bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Tarefas Criadas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={tasksByMonth}>
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <RechartsTooltip content={CustomBarTooltip} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TaskStatus | "todos")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as TaskPriority | "todos")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
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
            Mostrando {resultCount} de {totalCount} {resultCount === 1 ? "tarefa" : "tarefas"}
          </div>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card 
          className="border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-white shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          onClick={() => {
            setSelectedStat('total');
            setDetailsDialogOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-warning bg-gradient-to-br from-warning/10 via-background to-white shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          onClick={() => {
            setSelectedStat('pendentes');
            setDetailsDialogOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Pendentes</p>
                <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
              </div>
              <Circle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-white shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          onClick={() => {
            setSelectedStat('emAndamento');
            setDetailsDialogOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Em Andamento</p>
                <p className="text-2xl font-bold text-primary">{stats.emAndamento}</p>
              </div>
              <Filter className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-success bg-gradient-to-br from-success/10 via-background to-white shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          onClick={() => {
            setSelectedStat('concluidas');
            setDetailsDialogOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Concluídas</p>
                <p className="text-2xl font-bold text-success">{stats.concluidas}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-destructive bg-gradient-to-br from-destructive/10 via-background to-white shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          onClick={() => {
            setSelectedStat('atrasadas');
            setDetailsDialogOpen(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Atrasadas</p>
                <p className="text-2xl font-bold text-destructive">{stats.atrasadas}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-elegant mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TaskStatus | "todos")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as TaskPriority | "todos")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>

            {(filterStatus !== "todos" || filterPriority !== "todos") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus("todos");
                  setFilterPriority("todos");
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Excluir Selecionadas */}
      {selectedTasks.size > 0 && (
        <div className="mb-4 flex items-center justify-between p-4 bg-destructive/10 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-destructive">
              {selectedTasks.size} {selectedTasks.size === 1 ? 'tarefa selecionada' : 'tarefas selecionadas'}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Selecionadas
          </Button>
        </div>
      )}

      {/* Cards de Tarefas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {sortedTasks?.length === 0 ? (
          <Card className="col-span-full flex flex-col items-center justify-center py-12">
            <span className="text-2xl">✅</span>
            <span className="font-medium text-muted-foreground mt-2">Nenhuma tarefa encontrada</span>
          </Card>
        ) : (
          sortedTasks?.map((task: any) => {
            const status = getTaskStatus(task);
            const priority = getTaskPriority(task);
            const overdue = isOverdue(task.due_date);
            const isSelected = selectedTasks.has(task.id);
            // Bordas e cores conforme status/priority/seleção
            let borderColor = "border-muted";
            if (overdue) borderColor = "border-destructive";
            else if (isSelected) borderColor = "border-primary";
            else if (status === "pendente") borderColor = "border-warning";
            else if (status === "em_andamento") borderColor = "border-primary";
            else if (status === "concluida") borderColor = "border-success";

            let bgGradient = "bg-gradient-to-br from-background via-white to-muted/40";
            if (overdue) bgGradient = "bg-gradient-to-br from-destructive/10 via-background to-white";
            else if (status === "concluida") bgGradient = "bg-gradient-to-br from-success/10 via-background to-white";
            else if (status === "em_andamento") bgGradient = "bg-gradient-to-br from-primary/10 via-background to-white";
            else if (status === "pendente") bgGradient = "bg-gradient-to-br from-warning/10 via-background to-white";

            // Estado para dialog de exclusão individual
            const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

            return (
              <>
                <Card
                  key={task.id}
                  className={`border-2 ${borderColor} shadow-elegant hover:shadow-elegant-lg transition-all duration-300 ${bgGradient} cursor-pointer hover:scale-[1.03] active:scale-[0.98] rounded-xl ${status === "concluida" ? "opacity-60" : ""}`}
                  onClick={() => handleEdit(task)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg truncate ${status === "concluida" ? "line-through" : ""}`}>{task.title}</span>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelectTask(task.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={`text-xs ${statusColors[status]}`}>{statusLabels[status]}</Badge>
                      <Badge className={`text-xs ${priorityColors[priority]}`}>{priorityLabels[priority]}</Badge>
                      {overdue && <Badge className="text-xs bg-destructive/20 text-destructive">Atrasada</Badge>}
                      {task.category && <Badge variant="outline" className="text-xs">{task.category}</Badge>}
                      {task.recurrence_type && (
                        <Badge variant="outline" className="capitalize text-xs">
                          {task.recurrence_type === "diaria" && "Diária"}
                          {task.recurrence_type === "semanal" && "Semanal"}
                          {task.recurrence_type === "mensal" && "Mensal"}
                          {task.recurrence_type === "anual" && "Anual"}
                          {task.recurrence_type === "personalizada" && "Personalizada"}
                          {task.recurrence_interval > 1 && ` (a cada ${task.recurrence_interval})`}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {task.description || "-"}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium ${overdue ? "text-destructive" : ""}`}>
                        Vencimento: {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </span>
                      <div className="flex gap-1">
                        <IconButton
                          icon={Pencil}
                          onClick={handleEdit.bind(null, task)}
                          variant="edit"
                        />
                        <IconButton
                          icon={Trash2}
                          onClick={() => setDeleteDialogOpen(true)}
                          variant="delete"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Dialog de confirmação de exclusão individual */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(task.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            );
          })
        )}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados da tarefa abaixo." : "Preencha os dados para criar uma nova tarefa."}
            </DialogDescription>
          </DialogHeader>
          {/* DialogDescription para acessibilidade, mesmo que vazio */}
          <DialogDescription className="sr-only" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, title: value }))}
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
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  onBlur={(e) => handleStandardizeInput(e.target.value, (value) => setFormData({ ...formData, category: value }))}
                  placeholder="Ex: Trabalho, Pessoal..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seção de Recorrência */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="recurrence_type">Recorrência</Label>
                <Select
                  value={formData.recurrence_type || "nenhuma"}
                  onValueChange={(value) => {
                    if (value === "nenhuma") {
                      setFormData({ ...formData, recurrence_type: "", recurrence_end_date: "", recurrence_interval: 1 });
                    } else {
                      setFormData({ ...formData, recurrence_type: value as any });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Sem recorrência</SelectItem>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurrence_type && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurrence_interval">
                        {formData.recurrence_type === "diaria" && "A cada quantos dias?"}
                        {formData.recurrence_type === "semanal" && "A cada quantas semanas?"}
                        {formData.recurrence_type === "mensal" && "A cada quantos meses?"}
                        {formData.recurrence_type === "anual" && "A cada quantos anos?"}
                      </Label>
                      <Input
                        id="recurrence_interval"
                        type="number"
                        min="1"
                        value={formData.recurrence_interval}
                        onChange={(e) => setFormData({ ...formData, recurrence_interval: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurrence_end_date">Data Final (Opcional)</Label>
                      <Input
                        id="recurrence_end_date"
                        type="date"
                        value={formData.recurrence_end_date}
                        onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                        min={formData.due_date}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.recurrence_type === "diaria" && `A tarefa será criada a cada ${formData.recurrence_interval} dia(s)`}
                    {formData.recurrence_type === "semanal" && `A tarefa será criada a cada ${formData.recurrence_interval} semana(s)`}
                    {formData.recurrence_type === "mensal" && `A tarefa será criada a cada ${formData.recurrence_interval} mês(es)`}
                    {formData.recurrence_type === "anual" && `A tarefa será criada a cada ${formData.recurrence_interval} ano(s)`}
                    {formData.recurrence_end_date && ` até ${format(parseISO(formData.recurrence_end_date), "dd/MM/yyyy", { locale: ptBR })}`}
                    {!formData.recurrence_end_date && " (por 1 ano)"}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefas</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedTasks.size} {selectedTasks.size === 1 ? 'tarefa selecionada' : 'tarefas selecionadas'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMultipleMutation.isPending}
            >
              {deleteMultipleMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Detalhes das Estatísticas */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStat === "total" && "Detalhes - Total de Tarefas"}
              {selectedStat === "pendentes" && "Detalhes - Tarefas Pendentes"}
              {selectedStat === "emAndamento" && "Detalhes - Tarefas em Andamento"}
              {selectedStat === "concluidas" && "Detalhes - Tarefas Concluídas"}
              {selectedStat === "atrasadas" && "Detalhes - Tarefas Atrasadas"}
            </DialogTitle>
            <DialogDescription>
              {selectedStat === "total" && `Lista completa de todas as ${stats.total} tarefas cadastradas.`}
              {selectedStat === "pendentes" && `Lista das ${stats.pendentes} tarefas pendentes.`}
              {selectedStat === "emAndamento" && `Lista das ${stats.emAndamento} tarefas em andamento.`}
              {selectedStat === "concluidas" && `Lista das ${stats.concluidas} tarefas concluídas.`}
              {selectedStat === "atrasadas" && `Lista das ${stats.atrasadas} tarefas atrasadas.`}
            </DialogDescription>
          </DialogHeader>
          {/* DialogDescription para acessibilidade, mesmo que vazio */}
          <DialogDescription className="sr-only" />
          <div className="space-y-4">
            {selectedStat === "total" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskStatus(task)]}>
                            {statusLabels[getTaskStatus(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskPriority(task)]}>
                            {priorityLabels[getTaskPriority(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{task.category || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "pendentes" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.filter((t: any) => getTaskStatus(t) === "pendente").map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskPriority(task)]}>
                            {priorityLabels[getTaskPriority(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{task.category || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "emAndamento" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.filter((t: any) => getTaskStatus(t) === "em_andamento").map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskPriority(task)]}>
                            {priorityLabels[getTaskPriority(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{task.category || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "concluidas" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.filter((t: any) => getTaskStatus(t) === "concluida").map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskPriority(task)]}>
                            {priorityLabels[getTaskPriority(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                        <TableCell>{task.category || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedStat === "atrasadas" && (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.filter((t: any) => isTaskOverdue(t)).map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title || "-"}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[getTaskPriority(task)]}>
                            {priorityLabels[getTaskPriority(task)]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-destructive font-bold">
                          {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                        </TableCell>
                        <TableCell>{task.category || "-"}</TableCell>
                      </TableRow>
                    ))}
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


