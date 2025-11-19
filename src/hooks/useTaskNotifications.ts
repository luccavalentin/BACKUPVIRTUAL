import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskNotification {
  id: string;
  title: string;
  due_date: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
}

export function useTaskNotifications() {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [hasTodayTasks, setHasTodayTasks] = useState(false);
  const [hasUncompletedTodayTasks, setHasUncompletedTodayTasks] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  useEffect(() => {
    if (!tasks) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const relevantTasks: TaskNotification[] = [];
    let hasToday = false;
    let hasUncompletedToday = false;

    tasks.forEach((task: any) => {
      const taskStatus = task.status || (task.completed ? "concluida" : "pendente");
      if (taskStatus === "concluida") return;

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const isOverdue = dueDate < today;
      const isToday = dueDate.getTime() === today.getTime();
      const isTomorrow = dueDate.getTime() === tomorrow.getTime();

      if (isToday || isTomorrow || isOverdue) {
        relevantTasks.push({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          isOverdue,
          isToday,
          isTomorrow,
        });

        if (isToday) {
          hasToday = true;
          if (taskStatus !== "concluida") {
            hasUncompletedToday = true;
          }
        }
      }
    });

    // Ordenar: vencidas primeiro, depois hoje, depois amanhã
    relevantTasks.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      if (a.isTomorrow && !b.isTomorrow) return -1;
      if (!a.isTomorrow && b.isTomorrow) return 1;
      return 0;
    });

    setNotifications(relevantTasks);
    setHasTodayTasks(hasToday);
    setHasUncompletedTodayTasks(hasUncompletedToday);
  }, [tasks]);

  // Verificar se há tarefas vencidas ou por vencer
  const hasUrgentTasks = notifications.some(
    (n) => n.isOverdue || n.isToday || n.isTomorrow
  );

  return {
    notifications,
    hasTodayTasks,
    hasUncompletedTodayTasks,
    hasUrgentTasks,
    pendingCount: tasks?.filter((t: any) => {
      const status = t.status || (t.completed ? "concluida" : "pendente");
      return status !== "concluida";
    }).length || 0,
  };
}

