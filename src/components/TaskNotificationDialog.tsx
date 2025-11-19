import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTaskNotifications, TaskNotification } from "@/hooks/useTaskNotifications";

export function TaskNotificationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, hasUncompletedTodayTasks } = useTaskNotifications();
  const navigate = useNavigate();

  // Verificar se o popup já foi mostrado hoje
  const getTodayKey = () => {
    const today = new Date();
    return `task-notification-shown-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const hasBeenShownToday = () => {
    return localStorage.getItem(getTodayKey()) === "true";
  };

  const markAsShownToday = () => {
    localStorage.setItem(getTodayKey(), "true");
  };

  useEffect(() => {
    // Verificar se há tarefas relevantes (vencidas, hoje ou amanhã)
    const hasRelevantTasks = notifications.some(
      (n) => n.isOverdue || n.isToday || n.isTomorrow
    );

    // Mostrar popup apenas se:
    // 1. Há tarefas relevantes
    // 2. O popup não está aberto
    // 3. O popup ainda não foi mostrado hoje
    if (hasRelevantTasks && !isOpen && !hasBeenShownToday()) {
      setIsOpen(true);
      markAsShownToday();
    }
  }, [notifications, isOpen]);

  const todayTasks = notifications.filter((n) => n.isToday);
  const tomorrowTasks = notifications.filter((n) => n.isTomorrow);
  const overdueTasks = notifications.filter((n) => n.isOverdue);

  const handleGoToTasks = () => {
    setIsOpen(false);
    navigate("/tarefas");
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // Já foi marcado como mostrado no useEffect quando abriu
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Se estiver fechando, garantir que está marcado como mostrado
    if (!open) {
      markAsShownToday();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Atenção: Tarefas Próximas do Vencimento
          </DialogTitle>
          <DialogDescription>
            Você tem tarefas vencendo hoje ou amanhã que precisam de atenção
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {overdueTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Tarefas Vencidas ({overdueTasks.length})
              </h3>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencida em {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="destructive">Vencida</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-warning mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarefas de Hoje ({todayTasks.length})
              </h3>
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-warning/20 bg-warning/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">Vence hoje!</p>
                      </div>
                      <Badge className="bg-warning/10 text-warning">Hoje</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tomorrowTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tarefas de Amanhã ({tomorrowTasks.length})
              </h3>
              <div className="space-y-2">
                {tomorrowTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-primary/20 bg-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Vence amanhã ({format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })})
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">Amanhã</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleDismiss}>
            Fechar
          </Button>
          <Button onClick={handleGoToTasks} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ir para Tarefas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

