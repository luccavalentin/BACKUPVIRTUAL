import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/useTableSort";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Lembretes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { sortedData: sortedReminders, SortButton } = useTableSort(reminders);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("reminders").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Lembrete criado com sucesso!" });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("reminders").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Lembrete atualizado com sucesso!" });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Lembrete excluído com sucesso!" });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("reminders").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
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

  const handleEdit = (reminder: any) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      due_date: reminder.due_date,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      due_date: "",
    });
  };

  return (
    <div>
      <PageHeader
        title="Lembretes"
        description="Não esqueça de suas tarefas importantes"
        action={{
          label: "Novo Lembrete",
          onClick: () => setIsDialogOpen(true),
        }}
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sortedReminders?.map((reminder) => (
          <Card key={reminder.id} className={reminder.completed ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={reminder.completed || false}
                  onCheckedChange={(checked) =>
                    toggleCompleteMutation.mutate({
                      id: reminder.id,
                      completed: checked as boolean,
                    })
                  }
                />
                <CardTitle className={`text-lg font-bold ${reminder.completed ? "line-through" : ""}`}>{reminder.title}</CardTitle>
              </div>
              <CardDescription className="truncate">
                {reminder.description || "-"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  !reminder.completed && new Date(reminder.due_date) < new Date()
                    ? "text-destructive font-medium"
                    : ""
                }`}>
                  Vencimento: {format(new Date(reminder.due_date), "dd/MM/yyyy")}
                </span>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(reminder)}
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(reminder.id)}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Lembrete" : "Novo Lembrete"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Edite os dados do lembrete abaixo." : "Preencha os dados para criar um novo lembrete."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
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
    </div>
  );
}
