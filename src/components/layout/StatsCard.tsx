import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
  onClick?: () => void;
  showAlert?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, variant = "default", className, onClick, showAlert = false }: StatsCardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  const borderStyles = {
    default: "border-2 border-primary/40 rounded-2xl",
    success: "border-2 border-success/50 rounded-2xl",
    warning: "border-2 border-warning/50 rounded-2xl",
    destructive: "border-2 border-destructive/50 rounded-2xl",
  };

  return (
    <Card 
      className={cn(
        "group shadow-elegant-lg bg-gradient-card stats-card relative overflow-hidden w-full rounded-2xl", 
        borderStyles[variant], 
        onClick && "cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20",
        "active:scale-[0.97]",
        "hover:border-opacity-100 hover:border-2",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6 relative">
        {/* Efeito de brilho no hover */}
        {onClick && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className={cn(
              "absolute inset-0 blur-xl",
              variant === "success" ? "bg-success/20" :
              variant === "destructive" ? "bg-destructive/20" :
              variant === "warning" ? "bg-warning/20" :
              "bg-primary/20"
            )} />
          </div>
        )}
        {showAlert && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-destructive/90 rounded-full p-3 shadow-lg animate-pulse-alert">
              <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2 sm:space-y-2.5 flex-1 min-w-0">
            <p className={cn(
              "text-[10px] sm:text-xs font-semibold uppercase tracking-wider",
              variant === "success" ? "text-success" : 
              variant === "destructive" ? "text-destructive" : 
              variant === "warning" ? "text-warning" : 
              "text-muted-foreground"
            )}>{title}</p>
            <p className={cn(
              "text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-tight break-all overflow-wrap-anywhere",
              variant === "success" ? "text-success" : 
              variant === "destructive" ? "text-destructive" : 
              variant === "warning" ? "text-warning" : 
              "text-foreground"
            )} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{value}</p>
            {trend && (
              <p className={cn("text-[10px] sm:text-xs font-semibold flex items-center gap-1", trend.isPositive ? "text-success" : "text-destructive")}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "relative p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm overflow-hidden transition-all duration-300 flex-shrink-0 ml-2 sm:ml-4",
            variantStyles[variant],
            "group-hover:scale-110 group-hover:rotate-3",
            "group-active:scale-95"
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 relative z-10 icon-professional transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
